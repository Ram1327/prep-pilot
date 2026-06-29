import React from "react";
import PipelineProgress from "./PipelineProgress";
import { AgentStatus } from "../../types/agent";

interface LoadingStateProps {
  pipelineAgents: AgentStatus[];
}

export default function LoadingState({ pipelineAgents }: LoadingStateProps) {
  return (
    <div 
      id="loading-card"
      className="w-full max-w-[500px] mx-auto mt-12 p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl flex flex-col items-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-fadeIn"
    >
      {/* Spinning Gradient Ring */}
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-10 blur-md animate-pulse" />
        <div 
          className="w-12 h-12 rounded-full border-4 border-t-transparent border-r-[var(--accent-primary)] border-b-transparent border-l-[var(--accent-secondary)] animate-spin"
        />
        <div className="absolute w-3 h-3 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)] animate-ping" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--accent-secondary)] mb-4 block">
        ✦ Multi-Agent Orchestration ✦
      </span>

      {/* Embedded Real-time Pipeline Indicator */}
      <PipelineProgress agents={pipelineAgents} />

      <p className="text-center text-[11px] text-[var(--text-muted)] leading-relaxed border-t border-white/5 pt-4 mt-4 w-full font-sans">
        PrepPilot is actively running a cooperative multi-agent workflow. The Intake results are grounded with live Google Search queries before final plan synthesis.
      </p>
    </div>
  );
}
