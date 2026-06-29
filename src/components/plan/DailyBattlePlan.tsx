import React from "react";
import DayCard from "./DayCard";
import { DayPlan } from "../../types/plan";
import { DayStatus } from "../../types/agent";

interface DailyBattlePlanProps {
  dailyPlan: DayPlan[];
  dayStatuses: DayStatus[];
  onMarkComplete: (dayIndex: number) => void;
  onMarkMissed: (dayIndex: number) => void;
  isReplanning: boolean;
}

export function DailyBattlePlan({
  dailyPlan,
  dayStatuses,
  onMarkComplete,
  onMarkMissed,
  isReplanning
}: DailyBattlePlanProps) {
  if (!dailyPlan || dailyPlan.length === 0) return null;

  return (
    <div 
      id="card-daily-plan"
      className="card flex flex-col hover:-translate-y-0.5 transition-transform duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Your Daily Action Plan
          </h3>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-semibold font-mono">
          Interactive Expandable Logs
        </span>
      </div>

      {isReplanning && (
        <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1.5 animate-pulse font-sans">
          <p className="text-xs font-semibold text-purple-300">
            ⚡ PrepPilot is adapting your plan...
          </p>
          <div className="h-1.5 w-full bg-purple-950/40 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: "60%" }} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {dailyPlan.map((dayPlan, index) => {
          const currentStatus = dayStatuses.find(d => d.dayIndex === index)?.status;
          return (
            <DayCard
              key={`${index}-${dayPlan.day}`}
              dayPlan={dayPlan}
              index={index}
              currentStatus={currentStatus}
              isReplanning={isReplanning}
              onMarkComplete={onMarkComplete}
              onMarkMissed={onMarkMissed}
            />
          );
        })}
      </div>
    </div>
  );
}

export default DailyBattlePlan;
