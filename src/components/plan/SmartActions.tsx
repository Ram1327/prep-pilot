import React, { useState } from "react";
import { 
  Mail, 
  Calendar, 
  Video, 
  FileText, 
  Presentation as PresentationIcon, 
  Loader2, 
  CheckCircle,
  Eye,
  History,
  ExternalLink
} from "lucide-react";
import { SmartAction, ActionResult, IntegrationHistoryItem } from "../../types/plan";
import WorkspaceIntegrationModal from "./WorkspaceIntegrationModal";
import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface SmartActionsProps {
  smartActions: ActionResult | null | undefined;
  plan?: any;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  onActionsGenerated?: (actions: ActionResult) => void;
  addIntegrationHistory: (taskId: string, item: Omit<IntegrationHistoryItem, 'id' | 'executedAt'>) => Promise<void>;
  integrationHistory?: IntegrationHistoryItem[];
}

export default function SmartActions({ 
  smartActions, 
  plan,
  googleAccessToken, 
  signInWithGoogle,
  onActionsGenerated,
  addIntegrationHistory,
  integrationHistory = []
}: SmartActionsProps) {
  const [selectedAction, setSelectedAction] = useState<SmartAction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const actions = smartActions?.actions || [];

  const handleGenerateActions = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch('/api/generate-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate integrations');
      }
      if (onActionsGenerated) {
        onActionsGenerated(data);
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to generate Workspace integrations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'outline';
    }
  };

  if (actions.length === 0) {
    return (
      <Card className="p-6 flex flex-col gap-4 border-white/10 relative overflow-hidden bg-[var(--bg-card)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              WORKSPACE INTEGRATIONS
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
              Google Workspace smart actions
            </p>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/15">
            Actions Pending
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
            PrepPilot compiles customized integration shortcuts for Gmail, Calendar, Meet, Docs, and Slides to help organize your milestones directly inside your Google account.
          </p>

          {generationError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs leading-relaxed">
              ⚠️ {generationError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] font-semibold bg-white/5 px-2 py-1 rounded text-slate-400 font-mono uppercase tracking-wider">Gmail</span>
              <span className="text-[10px] font-semibold bg-white/5 px-2 py-1 rounded text-slate-400 font-mono uppercase tracking-wider">Calendar</span>
              <span className="text-[10px] font-semibold bg-white/5 px-2 py-1 rounded text-slate-400 font-mono uppercase tracking-wider">Docs</span>
              <span className="text-[10px] font-semibold bg-white/5 px-2 py-1 rounded text-slate-400 font-mono uppercase tracking-wider">Slides</span>
              <span className="text-[10px] font-semibold bg-white/5 px-2 py-1 rounded text-slate-400 font-mono uppercase tracking-wider">Meet</span>
            </div>
            
            <button
              disabled={isGenerating}
              onClick={handleGenerateActions}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Compiling Actions...
                </>
              ) : (
                "Generate Workspace Integrations"
              )}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 flex flex-col gap-4 border-white/10 relative overflow-hidden bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            SMART ACTIONS
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-sans">
            Interactive Google Workspace integrations
          </p>
        </div>
        <span className="text-xs font-semibold bg-white/5 px-2.5 py-1 rounded-md text-[var(--text-muted)] border border-white/5">
          {actions.length} action{actions.length > 1 ? 's' : ''} ready
        </span>
      </div>

      {/* Handle non-Google User block */}
      {!googleAccessToken && (
        <div className="p-4 bg-[rgba(251,188,4,0.06)] border border-[rgba(251,188,4,0.15)] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-xs text-[#fbbf24] leading-relaxed">
            Sign in with Google to enable Gmail, Calendar, Meet, Docs & Slides integrations.
          </p>
          <button 
            onClick={signInWithGoogle} 
            className="self-start md:self-auto shrink-0 px-4 py-2 rounded-lg bg-[#fbbf24] hover:bg-[#fbbf24]/90 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Connect Google Account
          </button>
        </div>
      )}

      {/* Actions list */}
      <div className="flex flex-col gap-3">
        {actions.map((action) => {
          const serviceColor = getServiceColor(action.type);
          const hasPastExecution = integrationHistory.some(h => h.type === action.type);

          return (
            <div 
              key={action.id}
              className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg shrink-0 mt-0.5" 
                  style={{ backgroundColor: `${serviceColor}15`, color: serviceColor }}
                >
                  {getServiceIcon(action.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-[10px] font-bold tracking-wider uppercase" 
                      style={{ color: serviceColor }}
                    >
                      {action.type}
                    </span>
                    <Badge variant={getPriorityBadgeColor(action.priority)}>
                      {action.priority.toUpperCase()}
                    </Badge>
                    {hasPastExecution && (
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        Executed
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-1">
                    {action.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Configure button */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => setSelectedAction(action)}
                  className="px-4 py-1.5 rounded-lg border border-white/15 hover:bg-white/5 text-xs text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Eye size={12} />
                  Open & Refine
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Collapsible Recent Executions log */}
      {integrationHistory.length > 0 && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <button 
            onClick={() => setShowFullHistory(!showFullHistory)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <History size={14} className="text-indigo-400" />
              <span className="font-semibold uppercase tracking-wider font-mono text-[10px]">Recent Executions Log ({integrationHistory.length})</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{showFullHistory ? "▲ Hide Log" : "▼ Show Log"}</span>
          </button>

          {showFullHistory && (
            <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {integrationHistory.map((historyItem) => {
                const color = getServiceColor(historyItem.type);
                return (
                  <div key={historyItem.id} className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/5 p-3 rounded-lg hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="p-1 rounded"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {getServiceIcon(historyItem.type, { size: 12 })}
                      </span>
                      <div>
                        <span className="text-slate-300 font-medium capitalize">{historyItem.type} integration</span>
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(historyItem.executedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={historyItem.resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-[11px] font-semibold text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {historyItem.resultLabel}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interactive Integration Modal */}
      {selectedAction && (
        <WorkspaceIntegrationModal 
          action={selectedAction} 
          plan={plan}
          googleAccessToken={googleAccessToken}
          signInWithGoogle={signInWithGoogle}
          addIntegrationHistory={addIntegrationHistory}
          integrationHistory={integrationHistory}
          onClose={() => setSelectedAction(null)} 
        />
      )}
    </Card>
  );
}
