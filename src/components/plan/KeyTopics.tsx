import React from "react";
import TopicCard from "./TopicCard";
import { KeyTopic } from "../../types/plan";

interface KeyTopicsProps {
  keyTopics: KeyTopic[];
  goalSummary: string;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function KeyTopics({ keyTopics, goalSummary, onShowToast }: KeyTopicsProps) {
  if (!keyTopics || keyTopics.length === 0) return null;

  return (
    <div 
      id="card-topics"
      className="card flex flex-col hover:-translate-y-0.5 transition-transform duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center gap-2 mb-3 font-sans">
        <span className="text-lg">🧠</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          Critical Focus Areas
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {keyTopics.map((topic, idx) => (
          <TopicCard 
            key={idx}
            topic={topic}
            goalSummary={goalSummary}
            onShowToast={onShowToast}
          />
        ))}
      </div>
    </div>
  );
}

export default KeyTopics;
