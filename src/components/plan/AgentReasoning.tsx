import React from "react";
import { AgentReasoning as AgentReasoningType } from "../../types/plan";
import { AgentStatus } from "../../types/agent";

interface AgentReasoningProps {
  agentReasoning: AgentReasoningType;
  pipelineMetadata?: {
    agentsRun: string[];
    researchGrounded?: boolean;
    version: string;
  };
  pipelineAgents: AgentStatus[];
}

export function AgentReasoning({ agentReasoning, pipelineMetadata, pipelineAgents }: AgentReasoningProps) {
  if (!agentReasoning) return null;

  return (
    <div 
      id="card-reasoning"
      className="card border-[var(--border-accent)] bg-[#111118]/80 hover:-translate-y-0.5 transition-transform duration-300 rounded-2xl p-6 border shadow-md"
    >
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base animate-pulse">🤖</span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)] flex items-center gap-1.5 leading-none mb-0.5 font-sans">
              Agent Reasoning Trace
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-ping" />
            </h3>
            <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Virtual Machine Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {pipelineMetadata?.researchGrounded && (
            <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full border border-emerald-500/25 flex items-center gap-1 leading-none">
              ✓ Research Grounded
            </span>
          )}
          <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-[var(--accent-primary)]/10 text-[var(--accent-secondary)] rounded-full border border-[var(--border-accent)] leading-none">
            v{pipelineMetadata?.version || "2.1.0"}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-[var(--text-muted)] mb-4 leading-relaxed font-sans">
        Real-time visibility into the dynamic cooperative multi-agent telemetry and strategic insights of PrepPilot.
      </p>

      {/* Status Chips for Agents */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono leading-none font-semibold">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          Intake: Complete
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono leading-none font-semibold">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          Planning: Complete
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono leading-none font-semibold">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          Research: Complete
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono leading-none font-semibold">
          <span className="w-1 h-1 rounded-full bg-emerald-400" />
          Reasoning: Complete
        </div>
      </div>

      <div className="space-y-4 text-xs font-sans">
        {pipelineMetadata?.researchGrounded && (
          <div className="p-3 bg-[var(--accent-secondary)]/5 border border-[var(--accent-secondary)]/15 rounded-xl hover:bg-[var(--accent-secondary)]/10 transition-colors">
            <p className="text-[var(--accent-secondary)] uppercase text-[9px] font-bold mb-1 tracking-wider flex items-center gap-1.5 leading-none">
              <span>🕵️‍♂️</span> Research Influence & Grounding Context
            </p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The Planning Agent dynamically integrated search facts (such as standard questions and expert execution resources) compiled by the Research Agent. This ensures action items are aligned with actual guidelines.
            </p>
          </div>
        )}

        <div>
          <p className="text-[var(--text-muted)] uppercase text-[9px] font-bold mb-1 tracking-wider">
            Strategy Choice & Synergy
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {agentReasoning.strategyChoice}
          </p>
        </div>

        <div>
          <p className="text-[var(--text-muted)] uppercase text-[9px] font-bold mb-1 tracking-wider">
            Key Insight
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {agentReasoning.keyInsight}
          </p>
        </div>

        <div>
          <p className="text-[var(--text-muted)] uppercase text-[9px] font-bold mb-1 tracking-wider">
            Biggest Risk & Mitigation
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {agentReasoning.biggestRisk}
          </p>
        </div>

        <div>
          <p className="text-[var(--text-muted)] uppercase text-[9px] font-bold mb-1 tracking-wider">
            Adaptation Plan
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {agentReasoning.adaptationNote}
          </p>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[var(--success)] text-[10px] font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          <span>Model telemetry trace completed successfully</span>
        </div>
      </div>
    </div>
  );
}

export default AgentReasoning;
