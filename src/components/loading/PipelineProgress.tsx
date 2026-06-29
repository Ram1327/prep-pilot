import React from "react";
import { AgentStatus } from "../../types/agent";

interface PipelineProgressProps {
  agents: AgentStatus[];
}

export function PipelineProgress({ agents }: PipelineProgressProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'intake': return "🔍";
      case 'planning': return "📋";
      case 'research': return "🔬";
      case 'reasoning': return "🤖";
      case 'actions': return "⚙️";
      default: return "⚡";
    }
  };

  return (
    <div className="w-full space-y-4 mb-2">
      {agents.map((step) => {
        let statusText = "○ Pending";
        let statusClass = "text-[var(--text-muted)]";
        let borderOutline = "border-transparent";
        let bgClass = "bg-transparent";
        let opacityClass = "opacity-40";

        if (step.status === "complete") {
          statusText = "✓ Complete";
          statusClass = "text-[var(--success)] font-semibold";
          opacityClass = "opacity-100";
        } else if (step.status === "running") {
          statusText = "⟳ Synthesizing...";
          statusClass = "text-[var(--accent-secondary)] font-bold animate-pulse";
          borderOutline = "border-[var(--border-accent)]/40";
          bgClass = "bg-white/5";
          opacityClass = "opacity-100";
        } else if (step.status === "error") {
          statusText = "✗ Error";
          statusClass = "text-[var(--danger)] font-bold";
          opacityClass = "opacity-100";
        }

        return (
          <div 
            key={step.name}
            className={`flex flex-col gap-1 p-3 rounded-xl border transition-all duration-300 ${bgClass} ${borderOutline} ${opacityClass}`}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getIcon(step.name)}</span>
                <span className="font-semibold tracking-wide text-[var(--text-primary)]">{step.displayName}</span>
              </div>
              <span className={`text-[10px] font-mono tracking-wider ${statusClass}`}>
                [{statusText}]
              </span>
            </div>
            
            {/* Active description for currently running/active agents */}
            {step.status === "running" && step.message && (
              <div className="pl-8 text-xs text-[var(--text-secondary)] italic animate-pulse">
                ↳ {step.message}
              </div>
            )}
            {step.status === "complete" && step.name === "research" && (
              <div className="pl-8 text-xs text-[var(--success)]/80">
                ↳ Found relevant online learning assets and tips
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PipelineProgress;
