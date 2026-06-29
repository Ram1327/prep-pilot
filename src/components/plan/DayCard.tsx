import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DayPlan } from "../../types/plan";
import { DayStatus } from "../../types/agent";

interface DayCardProps {
  key?: string | number;
  dayPlan: DayPlan;
  index: number;
  currentStatus?: 'complete' | 'missed';
  isReplanning: boolean;
  onMarkComplete: (dayIndex: number) => void;
  onMarkMissed: (dayIndex: number) => void;
}

export function DayCard({ 
  dayPlan, 
  index, 
  currentStatus, 
  isReplanning, 
  onMarkComplete, 
  onMarkMissed 
}: DayCardProps) {
  const isDayOne = dayPlan.day === 1;
  const [isExpanded, setIsExpanded] = useState(isDayOne && !currentStatus);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      id={`day-card-${dayPlan.day}`}
      className={`p-4 rounded-xl border transition-all duration-300 bg-[var(--bg-card)] ${
        isDayOne && !currentStatus 
          ? "border-[var(--accent-primary)]/40 shadow-[0_0_20px_rgba(108,99,255,0.08)] bg-gradient-to-r from-[var(--bg-card)] to-white/[0.01]" 
          : "border-white/5"
      } ${currentStatus === 'complete' ? 'border-emerald-500/25 bg-emerald-500/[0.01]' : ''} ${
        currentStatus === 'missed' ? 'border-red-500/20 bg-red-500/[0.01]' : ''
      }`}
    >
      <div 
        className="flex items-start md:items-center gap-4 cursor-pointer select-none"
        onClick={handleToggle}
      >
        {(() => {
          if (currentStatus === 'complete') {
            return (
              <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm shadow-md transition-all bg-gradient-to-br from-emerald-500 to-emerald-600 text-white scale-105 font-mono">
                ✓
              </div>
            );
          }
          if (currentStatus === 'missed') {
            return (
              <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm shadow-md transition-all bg-gradient-to-br from-red-500 to-red-600 text-white font-mono">
                ✗
              </div>
            );
          }
          if (dayPlan.isAdapted) {
            return (
              <div className="w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm shadow-md transition-all border-2 border-purple-500/60 bg-white/5 text-[var(--accent-secondary)] font-mono">
                {dayPlan.day}
              </div>
            );
          }
          return (
            <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm shadow-md transition-all font-mono ${
              isDayOne 
                ? "bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white scale-105"
                : "bg-white/10 text-[var(--text-primary)]"
            }`}>
              {dayPlan.day}
            </div>
          );
        })()}

        <div className="flex-1 min-w-0 font-sans">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] font-mono tracking-wider ${
              currentStatus ? "text-[var(--text-muted)] line-through" : "text-[var(--accent-secondary)] font-bold"
            }`}>
              {dayPlan.date || `Day ${dayPlan.day}`}
            </span>
            {isDayOne && !currentStatus && (
              <span className="bg-[var(--success)]/10 text-[var(--success)] text-[9px] font-bold px-2 py-0.5 rounded animate-pulse">
                Current Day
              </span>
            )}
            {currentStatus === 'complete' && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                COMPLETED
              </span>
            )}
            {currentStatus === 'missed' && (
              <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                MISSED
              </span>
            )}
            {dayPlan.isAdapted && (
              <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                ⚡ ADAPTED
              </span>
            )}
          </div>
          <p className={`text-sm font-semibold mt-1 truncate transition-all duration-300 ${
            currentStatus === 'complete'
              ? "text-[var(--text-muted)] line-through opacity-70"
              : "text-[var(--text-primary)]"
          }`}>
            {dayPlan.theme}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
            {dayPlan.focus}
          </p>
        </div>

        <button className="text-[var(--text-muted)] hover:text-white p-1 rounded-lg">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4 font-sans pl-14">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
              Action Items
            </p>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] list-disc pl-4 leading-relaxed">
              {dayPlan.tasks?.map((task, tIdx) => (
                <li key={tIdx}>{task}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/5">
            <p className="text-[9px] font-bold uppercase text-[var(--accent-secondary)] tracking-wider">
              Day Checkpoint Threshold
            </p>
            <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
              {dayPlan.checkpoint}
            </p>
          </div>

          {dayPlan.isAdapted && dayPlan.adaptationNote && (
            <p className="text-[11px] text-[var(--text-muted)] italic leading-relaxed pt-1">
              ⚡ adaptationNote: {dayPlan.adaptationNote}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
        <button
          disabled={!!currentStatus || isReplanning}
          onClick={(e) => {
            e.stopPropagation();
            onMarkComplete(index);
          }}
          className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs rounded-lg cursor-pointer font-medium hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          ✓ Complete
        </button>
        <button
          disabled={!!currentStatus || isReplanning}
          onClick={(e) => {
            e.stopPropagation();
            onMarkMissed(index);
          }}
          className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg cursor-pointer font-medium hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          ✗ Missed
        </button>
      </div>
    </div>
  );
}

export default DayCard;
