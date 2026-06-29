import React from "react";
import { 
  Mail, 
  Calendar, 
  Video, 
  FileText, 
  Presentation as PresentationIcon 
} from "lucide-react";
import { SmartAction } from "../../types/plan";

interface ActionPreviewModalProps {
  action: SmartAction | null;
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
  const props = { size: 16, style };
  switch (type) {
    case 'gmail': return <Mail {...props} />;
    case 'calendar': return <Calendar {...props} />;
    case 'meet': return <Video {...props} />;
    case 'docs': return <FileText {...props} />;
    case 'slides': return <PresentationIcon {...props} />;
    default: return <FileText {...props} />;
  }
};

export default function ActionPreviewModal({ action, onClose }: ActionPreviewModalProps) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span 
              className="p-1.5 rounded-lg"
              style={{ 
                backgroundColor: `${getServiceColor(action.type)}15`, 
                color: getServiceColor(action.type) 
              }}
            >
              {getServiceIcon(action.type)}
            </span>
            <span className="font-bold text-white text-sm">
              Preview Integration Prefills
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-sans text-sm text-slate-300">
          {action.type === 'gmail' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">To:</span>
                <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 font-mono text-xs min-h-[32px]">
                  {action.prefilled.to || "(Empty / Specify later)"}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Subject:</span>
                <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 font-semibold">
                  {action.prefilled.subject}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Email Body:</span>
                <pre className="bg-white/5 p-3 rounded-lg text-xs font-sans text-slate-200 whitespace-pre-wrap mt-1 leading-relaxed max-h-[250px] overflow-y-auto border border-white/5">
                  {action.prefilled.body}
                </pre>
              </div>
            </div>
          )}

          {action.type === 'calendar' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Event:</span>
                <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 font-semibold">
                  {action.prefilled.title}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs uppercase text-slate-500 font-mono">Starts At:</span>
                  <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 text-xs">
                    {new Date(action.prefilled.startTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-500 font-mono">Ends At:</span>
                  <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 text-xs">
                    {new Date(action.prefilled.endTime).toLocaleString()}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Description:</span>
                <div className="bg-white/5 p-3 rounded-lg text-xs text-slate-200 mt-1 leading-relaxed">
                  {action.prefilled.description || "(No description)"}
                </div>
              </div>
            </div>
          )}

          {action.type === 'meet' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Meeting Title:</span>
                <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 font-semibold">
                  {action.prefilled.title}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs uppercase text-slate-500 font-mono">Starts At:</span>
                  <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 text-xs">
                    {new Date(action.prefilled.startTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase text-slate-500 font-mono">Duration:</span>
                  <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 text-xs font-semibold">
                    {action.prefilled.duration} minutes
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Attendees:</span>
                <div className="bg-white/5 p-2.5 rounded-lg text-xs text-slate-200 mt-1 font-mono">
                  {action.prefilled.attendees && action.prefilled.attendees.length > 0
                    ? action.prefilled.attendees.join(', ')
                    : "Add attendees before scheduling"}
                </div>
              </div>
            </div>
          )}

          {action.type === 'docs' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Document Title:</span>
                <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 font-semibold">
                  {action.prefilled.title}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Content Preview (First 500 chars):</span>
                <pre className="bg-white/5 p-3 rounded-lg text-xs font-sans text-slate-200 whitespace-pre-wrap mt-1 leading-relaxed max-h-[220px] overflow-y-auto border border-white/5">
                  {action.prefilled.content ? action.prefilled.content.slice(0, 500) + (action.prefilled.content.length > 500 ? '...' : '') : ''}
                </pre>
              </div>
            </div>
          )}

          {action.type === 'slides' && (
            <div className="space-y-3">
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Presentation Title:</span>
                <div className="bg-white/5 p-2 rounded-lg text-slate-200 mt-1 font-semibold">
                  {action.prefilled.title}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase text-slate-500 font-mono">Slides Structure:</span>
                <div className="bg-white/5 p-3 rounded-lg text-xs text-slate-200 mt-1 space-y-2.5 max-h-[240px] overflow-y-auto border border-white/5">
                  {action.prefilled.slides?.map((slide, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
                      <span className="font-semibold text-white">{idx + 1}. {slide.title}</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-400">
                        {slide.bullets?.map((b, bulletIdx) => (
                          <li key={bulletIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
