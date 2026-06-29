import React from "react";
import { TimeAvailable } from "../../types/plan";

interface TimeAnalysisProps {
  timeAvailable: TimeAvailable;
  createdAt?: string;
}

const getIntensityConfig = (intensity: string) => {
  switch (intensity) {
    case "Critical":
      return { bg: "bg-[#ef4444]/20", text: "text-[#ef4444]", border: "border-[#ef4444]/30" };
    case "Intensive":
      return { bg: "bg-[#f97316]/20", text: "text-[#f97316]", border: "border-[#f97316]/30" };
    case "Moderate":
      return { bg: "bg-[#f59e0b]/20", text: "text-[#f59e0b]", border: "border-[#f59e0b]/30" };
    case "Light":
    default:
      return { bg: "bg-[#10b981]/20", text: "text-[#10b981]", border: "border-[#10b981]/30" };
  }
};

export function TimeAnalysis({ timeAvailable, createdAt }: TimeAnalysisProps) {
  if (!timeAvailable) return null;

  const style = getIntensityConfig(timeAvailable.intensity);
  const avgHours = timeAvailable.hoursPerDay || (timeAvailable.totalHours / timeAvailable.totalDays).toFixed(1);

  // Helper to safely parse dates
  const parseDate = (val: any): Date => {
    if (!val) return new Date();
    if (typeof val === 'object' && val.seconds !== undefined) {
      return new Date(val.seconds * 1000);
    }
    if (val instanceof Date) {
      return val;
    }
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) {
      return new Date();
    }
    return parsed;
  };

  const calculateRemaining = () => {
    if (!createdAt) return null;
    const now = new Date();
    const created = parseDate(createdAt);
    const deadline = new Date(created.getTime() + timeAvailable.totalDays * 24 * 60 * 60 * 1000);
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, totalHours: 0, isPast: true };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return { days, hours, totalHours, isPast: false };
  };

  const remaining = calculateRemaining();

  return (
    <div 
      id="card-time"
      className="card hover:-translate-y-0.5 transition-transform duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">⏱️</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] font-sans">
          Time Analysis
        </h3>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2 bg-black/20 p-4 md:p-5 rounded-2xl border border-[var(--border-subtle)]">
        {remaining ? (
          remaining.isPast ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight leading-none">
                DONE
              </span>
              <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold font-mono">
                DEADLINE REACHED
              </span>
            </div>
          ) : remaining.days > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight leading-none">
                  {remaining.days}
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold font-mono">
                  {remaining.days === 1 ? "DAY" : "DAYS"}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight leading-none">
                  {remaining.hours}
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold font-mono">
                  {remaining.hours === 1 ? "HOUR" : "HOURS"} LEFT
                </span>
              </div>
            </div>
          ) : remaining.hours > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-extrabold text-red-400 font-mono tracking-tight leading-none animate-pulse">
                {remaining.hours}
              </span>
              <span className="text-xs text-red-400 uppercase tracking-wider font-bold font-mono">
                {remaining.hours === 1 ? "HOUR" : "HOURS"} TO DEADLINE
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-extrabold text-red-500 font-sans tracking-tight leading-none animate-pulse">
                URGENT
              </span>
              <span className="text-xs text-red-500 uppercase tracking-wider font-bold font-mono">
                LESS THAN AN HOUR
              </span>
            </div>
          )
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] font-mono tracking-tight leading-none">
              {timeAvailable.totalDays}
            </span>
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold font-mono">
              DAYS TO DEADLINE
            </span>
          </div>
        )}
        
        <div className="hidden md:block h-10 w-px bg-white/10" />

        <div className="text-left flex-1 md:pl-4 font-sans">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            ~{avgHours} hours of focused action per day
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            ({timeAvailable.totalHours} total focused hours recommended)
          </p>
        </div>

        <div className="hidden md:block h-10 w-px bg-white/10" />

        <div>
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${style.bg} ${style.text} border ${style.border}`}>
            {timeAvailable.intensity}
          </div>
        </div>
      </div>

      <p className="text-xs italic text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-subtle)] leading-relaxed text-center font-sans">
        &ldquo;{timeAvailable.urgencyMessage}&rdquo;
      </p>
    </div>
  );
}

export default TimeAnalysis;
