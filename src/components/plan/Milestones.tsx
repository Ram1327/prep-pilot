import React from "react";
import { Milestone } from "../../types/plan";

interface MilestonesProps {
  milestones: Milestone[];
}

export function Milestones({ milestones }: MilestonesProps) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div 
      id="card-milestones"
      className="card hover:-translate-y-0.5 transition-transform duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🚩</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Success Milestones
          </h3>
        </div>
        <span className="text-[10px] text-[var(--accent-secondary)] font-semibold uppercase">
          Timeline Progress Map
        </span>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Vertical timeline line connecting dots */}
        <div className="absolute top-1.5 bottom-1.5 left-2.5 w-0.5 bg-gradient-to-b from-[var(--accent-primary)] to-[var(--bg-secondary)]" />

        {milestones.map((milestone, idx) => {
          const isFirst = idx === 0;
          return (
            <div key={idx} className="relative flex flex-col md:flex-row md:items-center justify-between gap-2">
              
              {/* Circle on the line */}
              <div className={`absolute -left-[20px] w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                isFirst 
                  ? "bg-[var(--accent-primary)] border-[var(--accent-secondary)] scale-110 shadow-[0_0_10px_var(--accent-primary)]" 
                  : "bg-[var(--bg-card)] border-[var(--text-muted)]"
              }`} />

              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {milestone.milestone}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Indicator: {milestone.successIndicator}
                </p>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] ${
                isFirst ? "text-[var(--accent-secondary)] border-[var(--border-accent)]" : "text-[var(--text-muted)]"
              }`}>
                Target: Day {milestone.targetDay}
              </span>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Milestones;
