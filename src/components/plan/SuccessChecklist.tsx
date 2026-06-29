import React, { useState } from "react";
import { Star } from "lucide-react";
import { ChecklistItem } from "../../types/plan";

interface SuccessChecklistProps {
  successChecklist: ChecklistItem[];
  checklistStatuses?: Record<string, boolean>;
  onToggleChecklist?: (updatedStatuses: Record<string, boolean>) => void;
}

export function SuccessChecklist({ 
  successChecklist, 
  checklistStatuses = {}, 
  onToggleChecklist 
}: SuccessChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!successChecklist || successChecklist.length === 0) return null;

  const totalItems = successChecklist.length;
  
  // Calculate completion percentage based only on active items in current plan
  const activeKeys = successChecklist.map((ch, idx) => `${idx}-${ch.item}`);
  const checkedCount = activeKeys.filter(k => !!checklistStatuses[k]).length;
  const completionPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const handleToggleChecklist = (key: string) => {
    const updated = {
      ...checklistStatuses,
      [key]: !checklistStatuses[key],
    };
    if (onToggleChecklist) {
      onToggleChecklist(updated);
    }
  };

  const shouldCollapse = completionPercentage === 100 && !isExpanded;

  // Render compact single-line card if checklist is 100% completed and not expanded
  if (shouldCollapse) {
    return (
      <div 
        id="card-checklist"
        onClick={() => setIsExpanded(true)}
        className="card flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-all duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-md group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base text-[var(--success)] animate-bounce">🎉</span>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Pre-Event Checklist Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[var(--success)] bg-[var(--success)]/10 px-2.5 py-0.5 rounded-full border border-[var(--success)]/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            100% Done
          </span>
          <span className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] underline ml-1.5 transition-colors">
            Show Details
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="card-checklist"
      className="card flex flex-col hover:-translate-y-0.5 transition-transform duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✅</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Pre-Event Checklist
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[var(--success)]">
            {completionPercentage}% Done
          </span>
          {completionPercentage === 100 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline cursor-pointer ml-2 transition-colors"
            >
              Collapse
            </button>
          )}
        </div>
      </div>

      {/* Glowing Completion Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full mb-4 overflow-hidden relative">
        <div 
          className="bg-[var(--success)] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Interactive Grouped Checkbox Items */}
      <div className="space-y-4 flex-1">
        {["Execution", "Practice", "Mindset", "Logistics"].map((cat) => {
          const itemsInCat = successChecklist.filter(item => item.category === cat);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} className="space-y-1.5">
              <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--text-muted)] border-b border-white/5 pb-1 mb-1.5">
                {cat}
              </h4>
              <div className="space-y-1.5">
                {successChecklist.map((ch, idx) => {
                  if (ch.category !== cat) return null;
                  const stateKey = `${idx}-${ch.item}`;
                  const isChecked = !!checklistStatuses[stateKey];

                  return (
                    <label 
                      key={idx}
                      className={`flex items-start gap-2.5 text-xs cursor-pointer select-none p-1 rounded hover:bg-white/[0.02] transition-all ${
                        isChecked ? "text-[var(--text-muted)] line-through" : "text-[var(--text-secondary)]"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="accent-[var(--accent-primary)] mt-0.5 w-3.5 h-3.5 rounded bg-[var(--bg-secondary)] border-white/10"
                        checked={isChecked}
                        onChange={() => handleToggleChecklist(stateKey)}
                      />
                      <span className="flex-1 leading-tight">
                        {ch.item}
                        {ch.isEssential && (
                          <Star className="inline w-3 h-3 text-[var(--warning)] fill-[var(--warning)] ml-1" />
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SuccessChecklist;
