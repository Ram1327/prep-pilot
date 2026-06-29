import React, { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { KeyTopic } from "../../types/plan";

interface TopicCardProps {
  key?: string | number;
  topic: KeyTopic;
  goalSummary: string;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const getImportanceConfig = (importance: string) => {
  switch (importance) {
    case "Critical":
      return { bg: "bg-red-500/20 text-red-400 border-red-500/30" };
    case "High":
      return { bg: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    case "Medium":
    default:
      return { bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  }
};

export function TopicCard({ topic, goalSummary, onShowToast }: TopicCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'practice' | 'cheat'>('summary');
  const [openPracticeQuestions, setOpenPracticeQuestions] = useState<Record<string, boolean>>({});

  const handleGenerateMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/topic-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.topic,
          context: goalSummary || "",
          importance: topic.importance
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate reference materials');
      }
      setMaterials(data);
      setActiveTab('summary');
    } catch (err) {
      if (onShowToast) {
        onShowToast('Could not generate materials. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const style = getImportanceConfig(topic.importance);

  return (
    <div className="p-4 rounded-xl bg-black/20 border border-[var(--border-subtle)] hover:border-white/10 transition-all font-sans">
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">
          {topic.topic}
        </p>
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${style.bg}`}>
          {topic.importance}
        </span>
      </div>
      
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2.5">
        {topic.whyItMatters}
      </p>

      <div>
        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
          Recommended Vector
        </p>
        <ul className="space-y-1">
          {topic.resources.map((resItem, xIdx) => (
            <li key={xIdx} className="text-xs text-[var(--text-secondary)] flex items-start gap-1">
              <span className="text-[var(--accent-secondary)] mt-0.5">•</span>
              <span className="leading-tight">{resItem}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* REFERENCE MATERIALS PANEL */}
      <div className="flex justify-end mt-3" onClick={(e) => e.stopPropagation()}>
        <button
          disabled={isLoading || !!materials}
          onClick={handleGenerateMaterials}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
            materials
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 cursor-default"
              : isLoading
              ? "bg-white/5 border-white/10 text-[var(--text-muted)] cursor-not-allowed"
              : "border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)] text-[var(--accent-secondary)] bg-[var(--accent-primary)]/5 hover:bg-[var(--accent-primary)]/10"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : materials ? (
            "✓ Materials Ready"
          ) : (
            "Generate Materials →"
          )}
        </button>
      </div>

      {materials && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
          <div className="flex border-b border-white/10">
            {(["summary", "practice", "cheat"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    isActive 
                      ? "border-[var(--accent-primary)] text-white font-bold" 
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {tab === 'summary' ? 'Summary' : tab === 'practice' ? 'Practice' : 'Cheat Sheet'}
                </button>
              );
            })}
          </div>

          {activeTab === "summary" && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-white/[0.01] p-3 rounded-lg border border-white/5 whitespace-pre-line font-light">
              {materials.summary}
            </p>
          )}

          {activeTab === "practice" && (
            <div className="space-y-2">
              {materials.practiceQuestions?.map((pq: any, qIdx: number) => {
                const isOpen = !!openPracticeQuestions[`${qIdx}`];
                return (
                  <div 
                    key={qIdx}
                    className="border border-white/5 rounded-lg bg-white/[0.01] overflow-hidden"
                  >
                    <div 
                      onClick={() => setOpenPracticeQuestions(prev => ({
                        ...prev,
                        [`${qIdx}`]: !isOpen
                      }))}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          pq.difficulty === 'Hard' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          pq.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {pq.difficulty || 'Medium'}
                        </span>
                        <p className="text-xs font-semibold text-[var(--text-primary)]">
                          {pq.question}
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{isOpen ? 'Hide' : 'Show'}</span>
                    </div>
                    {isOpen && (
                      <div className="p-3 border-t border-white/5 bg-black/20">
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                          {pq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "cheat" && (
            <ol className="space-y-2 list-decimal pl-5 text-[var(--text-secondary)] border-l-2 border-[var(--accent-primary)]/40 p-3 bg-white/[0.01] rounded-lg">
              {materials.cheatSheet?.map((point: string, pIdx: number) => (
                <li key={pIdx} className="font-mono text-[11px] leading-relaxed text-purple-200">
                  {point}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

export default TopicCard;
