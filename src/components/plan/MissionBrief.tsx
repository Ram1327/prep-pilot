import React from "react";

interface MissionBriefProps {
  goalSummary: string;
}

export function MissionBrief({ goalSummary }: MissionBriefProps) {
  if (!goalSummary) return null;

  return (
    <div 
      id="card-goal"
      className="card border-l-4 border-l-[var(--accent-primary)] hover:-translate-y-0.5 transition-transform duration-300 group bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg transition-transform group-hover:scale-110 duration-300">🎯</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Mission Brief
        </h3>
      </div>
      <p className="text-sm md:text-base font-light leading-relaxed text-[var(--text-primary)] font-sans">
        {goalSummary}
      </p>
    </div>
  );
}

export default MissionBrief;
