import React from "react";

interface EmptyStrategyViewProps {
  onNewTask: () => void;
}

export default function EmptyStrategyView({ onNewTask }: EmptyStrategyViewProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[50vh]">
      <div className="text-5xl mb-4">📋</div>
      <div className="text-lg text-slate-400 mb-4 font-medium">No strategy selected</div>
      <button 
        onClick={onNewTask} 
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:opacity-95 transition-all font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-purple-900/40"
      >
        + Create New Strategy
      </button>
    </div>
  );
}
