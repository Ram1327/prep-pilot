import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Calendar as CalendarIcon, 
  Video, 
  FileText, 
  Presentation as PresentationIcon, 
  Loader2, 
  CheckCircle,
  Sparkles,
  Clock,
  ExternalLink,
  History,
  AlertTriangle
} from "lucide-react";
import { SmartAction, IntegrationHistoryItem } from "../../types/plan";
import { 
  createGmailDraft, 
  createCalendarEvent, 
  scheduleMeeting, 
  createGoogleDoc, 
  createGoogleSlides 
} from "../../lib/googleApi";

interface WorkspaceIntegrationModalProps {
  action: SmartAction | null;
  plan: any;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  addIntegrationHistory: (taskId: string, item: Omit<IntegrationHistoryItem, 'id' | 'executedAt'>) => Promise<void>;
  integrationHistory?: IntegrationHistoryItem[];
  onClose: () => void;
}

const getServiceColor = (type: SmartAction['type']) => {
  switch (type) {
    case 'gmail': return '#ea4335';
    case 'calendar': return '#4285f4';
    case 'meet': return '#00897b';
    case 'docs': return '#4285f4';
    case 'slides': return '#fbbc04';
    default: return '#7c6aef';
  }
};

const getServiceIcon = (type: SmartAction['type'], style = {}) => {
  const props = { size: 18, style };
  switch (type) {
    case 'gmail': return <Mail {...props} />;
    case 'calendar': return <CalendarIcon {...props} />;
    case 'meet': return <Video {...props} />;
    case 'docs': return <FileText {...props} />;
    case 'slides': return <PresentationIcon {...props} />;
    default: return <FileText {...props} />;
  }
};

const getDefaultPrompt = (type: SmartAction['type']) => {
  switch (type) {
    case 'gmail': return "Draft a concise, professional email to a mentor or manager sharing my preparation plan and asking for accountability.";
    case 'calendar': return "Block focused preparation time today and tomorrow afternoon.";
    case 'docs': return "Create a dense quick-reference cheat-sheet covering the key topics in the plan.";
    case 'slides': return "Create a 3-slide overview: goal, daily plan summary, and key action items.";
    case 'meet': return "Schedule a 30-minute mock session or review call.";
    default: return "";
  }
};

export default function WorkspaceIntegrationModal({
  action,
  plan,
  googleAccessToken,
  signInWithGoogle,
  addIntegrationHistory,
  integrationHistory = [],
  onClose
}: WorkspaceIntegrationModalProps) {
  if (!action) return null;

  // State machine: idle | regenerating | executing | done
  const [status, setStatus] = useState<'idle' | 'regenerating' | 'executing' | 'done'>('idle');
  const [customPrompt, setCustomPrompt] = useState(getDefaultPrompt(action.type));
  const [lastRegenerated, setLastRegenerated] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [createdLabel, setCreatedLabel] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Editable fields local state
  const [gmailFields, setGmailFields] = useState({ to: "", subject: "", body: "" });
  const [calendarFields, setCalendarFields] = useState({ title: "", startTime: "", endTime: "", description: "" });
  const [meetFields, setMeetFields] = useState({ title: "", startTime: "", duration: 30, attendees: "" });
  const [docsFields, setDocsFields] = useState({ title: "", content: "" });
  const [slidesFields, setSlidesFields] = useState({ title: "", slides: [] as Array<{ title: string; bullets: string[] }> });

  // Initialize state from action.prefilled
  useEffect(() => {
    setErrorMessage(null);
    setCreatedUrl(null);
    setCreatedLabel(null);
    setStatus('idle');
    setCustomPrompt(getDefaultPrompt(action.type));
    setLastRegenerated(null);

    const prefilled = action.prefilled;
    if (action.type === 'gmail') {
      const p = prefilled as any;
      setGmailFields({ to: p.to || "", subject: p.subject || "", body: p.body || "" });
    } else if (action.type === 'calendar') {
      const p = prefilled as any;
      setCalendarFields({
        title: p.title || "",
        startTime: formatToDatetimeLocal(p.startTime),
        endTime: formatToDatetimeLocal(p.endTime),
        description: p.description || ""
      });
    } else if (action.type === 'meet') {
      const p = prefilled as any;
      setMeetFields({
        title: p.title || "",
        startTime: formatToDatetimeLocal(p.startTime),
        duration: p.duration || 30,
        attendees: Array.isArray(p.attendees) ? p.attendees.join(", ") : ""
      });
    } else if (action.type === 'docs') {
      const p = prefilled as any;
      setDocsFields({ title: p.title || "", content: p.content || "" });
    } else if (action.type === 'slides') {
      const p = prefilled as any;
      setSlidesFields({ title: p.title || "", slides: p.slides || [] });
    }
  }, [action]);

  // Helper to format ISO to datetime-local compatible format (YYYY-MM-DDThh:mm)
  function formatToDatetimeLocal(isoString?: string): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // Return tomorrow as a logical default
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      return tomorrow.toISOString().slice(0, 16);
    }
    // Offset local timezone representation
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  }

  // Handle refinement/regeneration via Backend Agent
  const handleRegenerate = async () => {
    setStatus('regenerating');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/regenerate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: action.type,
          customPrompt,
          context: plan?.goalSummary || action.title || "",
          planTheme: plan?.dailyPlan?.map((d: any) => d.theme).join(", ") || "",
          keyTopics: plan?.keyTopics?.map((t: any) => t.topic).join(", ") || "",
          daysAvailable: plan?.timeAvailable?.totalDays || 7
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate integration');
      }

      // Update editable fields
      if (action.type === 'gmail') {
        setGmailFields({ to: data.to || "", subject: data.subject || "", body: data.body || "" });
      } else if (action.type === 'calendar') {
        setCalendarFields({
          title: data.title || "",
          startTime: formatToDatetimeLocal(data.startTime),
          endTime: formatToDatetimeLocal(data.endTime),
          description: data.description || ""
        });
      } else if (action.type === 'meet') {
        setMeetFields({
          title: data.title || "",
          startTime: formatToDatetimeLocal(data.startTime),
          duration: data.duration || 30,
          attendees: Array.isArray(data.attendees) ? data.attendees.join(", ") : ""
        });
      } else if (action.type === 'docs') {
        setDocsFields({ title: data.title || "", content: data.content || "" });
      } else if (action.type === 'slides') {
        setSlidesFields({ title: data.title || "", slides: data.slides || [] });
      }

      setLastRegenerated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setStatus('idle');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to regenerate action prefill. Please try again.');
      setStatus('idle');
    }
  };

  // Handle Google API Execution using current editable fields
  const handleExecute = async () => {
    if (!googleAccessToken) {
      signInWithGoogle();
      return;
    }

    setStatus('executing');
    setErrorMessage(null);

    try {
      let resultUrl = "";
      let resultLabel = "";

      if (action.type === 'gmail') {
        const draft = await createGmailDraft(gmailFields.to, gmailFields.subject, gmailFields.body);
        resultUrl = draft.messageUrl;
        resultLabel = "Open Draft in Gmail";
      } else if (action.type === 'calendar') {
        // Convert datetime-local strings back to proper ISO Strings
        const startISO = new Date(calendarFields.startTime).toISOString();
        const endISO = new Date(calendarFields.endTime).toISOString();
        const event = await createCalendarEvent(calendarFields.title, calendarFields.description, startISO, endISO);
        resultUrl = event.htmlLink;
        resultLabel = "View in Calendar";
      } else if (action.type === 'meet') {
        const startISO = new Date(meetFields.startTime).toISOString();
        const emails = meetFields.attendees ? meetFields.attendees.split(",").map(e => e.trim()).filter(Boolean) : [];
        const meet = await scheduleMeeting(meetFields.title, startISO, meetFields.duration, emails);
        resultUrl = meet.meetLink || meet.calendarLink;
        resultLabel = "Join Google Meet";
      } else if (action.type === 'docs') {
        const doc = await createGoogleDoc(docsFields.title, docsFields.content);
        resultUrl = doc.docUrl;
        resultLabel = "Open in Google Docs";
      } else if (action.type === 'slides') {
        const slides = await createGoogleSlides(slidesFields.title, slidesFields.slides);
        resultUrl = slides.presentationUrl;
        resultLabel = "Open in Google Slides";
      }

      // Add to execution history
      if (plan?.id) {
        await addIntegrationHistory(plan.id, {
          type: action.type,
          resultUrl,
          resultLabel,
          customPrompt: lastRegenerated ? customPrompt : undefined
        });
      }

      setCreatedUrl(resultUrl);
      setCreatedLabel(resultLabel);
      setStatus('done');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Session expired') || err.message?.includes('access token')) {
        setErrorMessage('Your Google session has expired. Please disconnect and sign in again in the sidebar.');
      } else {
        setErrorMessage(err.message || 'Execution failed. Please try again.');
      }
      setStatus('idle');
    }
  };

  // Filter history to current integration type
  const typeHistory = integrationHistory.filter(h => h.type === action.type);
  const serviceColor = getServiceColor(action.type);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#0f0f15] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <span 
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: `${serviceColor}15`, 
                color: serviceColor 
              }}
            >
              {getServiceIcon(action.type)}
            </span>
            <div>
              <h2 className="font-bold text-white text-base">
                Configure & Run {action.type.toUpperCase()} Integration
              </h2>
              <p className="text-xs text-slate-400">
                Refine, edit pre-fills, and launch to Google Workspace
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-semibold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Body - 2-Column Split */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          
          {/* Column 1: AI Prompt Refinement */}
          <div className="flex flex-col gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Sparkles size={16} />
                <span>✨ Refine Prefills with AI</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tell PrepPilot how you want to customize this integration. You can specify a custom tone, ask it to highlight certain milestones, or change the target recipient.
              </p>
              
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value.slice(0, 500))}
                placeholder="Examples: 'Make the email body sound highly enthusiastic', 'Schedule the event for Friday morning', 'Focus cheat-sheet heavily on algorithms'"
                maxLength={500}
                rows={4}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition-all"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {customPrompt.length}/500 chars
                </span>
                
                <button
                  onClick={handleRegenerate}
                  disabled={status === 'regenerating' || status === 'executing'}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {status === 'regenerating' ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Regenerate Prefills
                    </>
                  )}
                </button>
              </div>

              {lastRegenerated && (
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 border-t border-white/5 pt-2">
                  <Clock size={10} />
                  <span>Last AI regeneration completed at {lastRegenerated}</span>
                </div>
              )}
            </div>

            {/* Error Message display */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed flex gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Column 2: Editable Prefills and Live Preview */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 flex-1 flex flex-col min-h-[300px]">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 border-b border-white/5 pb-2 mb-3 block">
                Prefilled Fields (Editable)
              </span>

              {status === 'regenerating' ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                  <span className="text-xs text-slate-400">Updating prefilled data...</span>
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
                  
                  {/* Gmail Fields */}
                  {action.type === 'gmail' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">To (Email):</label>
                        <input
                          type="email"
                          value={gmailFields.to}
                          onChange={(e) => setGmailFields({ ...gmailFields, to: e.target.value })}
                          placeholder="recipient@example.com"
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Subject:</label>
                        <input
                          type="text"
                          value={gmailFields.subject}
                          onChange={(e) => setGmailFields({ ...gmailFields, subject: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Body Content:</label>
                        <textarea
                          value={gmailFields.body}
                          onChange={(e) => setGmailFields({ ...gmailFields, body: e.target.value })}
                          rows={8}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Calendar Fields */}
                  {action.type === 'calendar' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Event Title:</label>
                        <input
                          type="text"
                          value={calendarFields.title}
                          onChange={(e) => setCalendarFields({ ...calendarFields, title: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Starts At:</label>
                          <input
                            type="datetime-local"
                            value={calendarFields.startTime}
                            onChange={(e) => setCalendarFields({ ...calendarFields, startTime: e.target.value })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Ends At:</label>
                          <input
                            type="datetime-local"
                            value={calendarFields.endTime}
                            onChange={(e) => setCalendarFields({ ...calendarFields, endTime: e.target.value })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Description:</label>
                        <textarea
                          value={calendarFields.description}
                          onChange={(e) => setCalendarFields({ ...calendarFields, description: e.target.value })}
                          rows={4}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Meet Fields */}
                  {action.type === 'meet' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Meeting Title:</label>
                        <input
                          type="text"
                          value={meetFields.title}
                          onChange={(e) => setMeetFields({ ...meetFields, title: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Starts At:</label>
                          <input
                            type="datetime-local"
                            value={meetFields.startTime}
                            onChange={(e) => setMeetFields({ ...meetFields, startTime: e.target.value })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Duration (Min):</label>
                          <input
                            type="number"
                            value={meetFields.duration}
                            onChange={(e) => setMeetFields({ ...meetFields, duration: parseInt(e.target.value) || 15 })}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Attendees (Comma-separated emails):</label>
                        <textarea
                          value={meetFields.attendees}
                          onChange={(e) => setMeetFields({ ...meetFields, attendees: e.target.value })}
                          placeholder="email1@example.com, email2@example.com"
                          rows={2}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Docs Fields */}
                  {action.type === 'docs' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Document Title:</label>
                        <input
                          type="text"
                          value={docsFields.title}
                          onChange={(e) => setDocsFields({ ...docsFields, title: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Document Content:</label>
                        <textarea
                          value={docsFields.content}
                          onChange={(e) => setDocsFields({ ...docsFields, content: e.target.value })}
                          rows={10}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Slides Fields */}
                  {action.type === 'slides' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase text-slate-500 font-mono block mb-1">Presentation Title:</label>
                        <input
                          type="text"
                          value={slidesFields.title}
                          onChange={(e) => setSlidesFields({ ...slidesFields, title: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      
                      <div className="space-y-3 mt-4 border-t border-white/5 pt-3">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Slides Content:</span>
                        {slidesFields.slides.map((slide, slideIdx) => (
                          <div key={slideIdx} className="bg-slate-950 border border-white/5 rounded-lg p-3 space-y-2">
                            <div>
                              <label className="text-[9px] uppercase text-slate-500 font-mono">Slide {slideIdx + 1} Title:</label>
                              <input
                                type="text"
                                value={slide.title}
                                onChange={(e) => {
                                  const updatedSlides = [...slidesFields.slides];
                                  updatedSlides[slideIdx].title = e.target.value;
                                  setSlidesFields({ ...slidesFields, slides: updatedSlides });
                                }}
                                className="w-full bg-slate-900 border border-white/5 rounded-md p-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase text-slate-500 font-mono">Bullets (one per line):</label>
                              <textarea
                                value={slide.bullets?.join("\n") || ""}
                                onChange={(e) => {
                                  const updatedSlides = [...slidesFields.slides];
                                  updatedSlides[slideIdx].bullets = e.target.value.split("\n");
                                  setSlidesFields({ ...slidesFields, slides: updatedSlides });
                                }}
                                rows={3}
                                className="w-full bg-slate-900 border border-white/5 rounded-md p-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>

        {/* Collapsible Execution History Section */}
        {typeHistory.length > 0 && (
          <div className="px-6 border-t border-white/5 bg-white/[0.005]">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="py-2.5 w-full flex items-center justify-between text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <History size={14} className="text-indigo-400" />
                <span>View Integration Run History ({typeHistory.length})</span>
              </div>
              <span className="font-mono text-[10px]">{showHistory ? "▲ Collapse" : "▼ Expand"}</span>
            </button>

            {showHistory && (
              <div className="pb-4 max-h-[140px] overflow-y-auto space-y-2 border-t border-white/5 pt-3">
                {typeHistory.map((h) => (
                  <div key={h.id} className="flex justify-between items-center text-xs bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={12} className="text-emerald-400" />
                      <span className="text-slate-200 font-medium">Executed:</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(h.executedAt).toLocaleString()}
                      </span>
                      {h.customPrompt && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]" title={h.customPrompt}>
                          ({h.customPrompt})
                        </span>
                      )}
                    </div>
                    <a
                      href={h.resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      {h.resultLabel}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-white/[0.01]">
          {/* Sign In notification if needed */}
          <div>
            {!googleAccessToken ? (
              <span className="text-xs text-yellow-500 font-medium flex items-center gap-1.5">
                ⚠️ Connect Google Account to Execute
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                ● Account Linked
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={status === 'executing'}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {status === 'done' ? (
              <a
                href={createdUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ backgroundColor: serviceColor }}
                className="px-5 py-2 rounded-xl text-white font-bold text-xs hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all"
              >
                <CheckCircle size={14} />
                {createdLabel || "Open Created Asset"}
              </a>
            ) : (
              <button
                disabled={status === 'regenerating' || status === 'executing'}
                onClick={handleExecute}
                style={{ 
                  backgroundColor: googleAccessToken ? serviceColor : 'rgba(255, 255, 255, 0.05)',
                  color: googleAccessToken ? '#fff' : 'rgba(255, 255, 255, 0.3)'
                }}
                className="px-5 py-2 rounded-xl font-bold text-xs hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {status === 'executing' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    Launch to Google
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
