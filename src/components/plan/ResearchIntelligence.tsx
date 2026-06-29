import React from "react";
import { ArrowRight } from "lucide-react";
import { ResearchResult } from "../../types/plan";

interface ResearchIntelligenceProps {
  research: ResearchResult;
}

const getResourceTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "course":
      return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
    case "article":
      return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    case "practice":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    case "book":
      return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    case "video":
    default:
      return "bg-purple-500/10 text-purple-400 border-purple-500/25";
  }
};

export function ResearchIntelligence({ research }: ResearchIntelligenceProps) {
  if (!research) return null;

  return (
    <div 
      id="card-research"
      className="card hover:-translate-y-0.5 transition-transform duration-300 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔬</span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-secondary)] leading-none mb-1">
              Research Intelligence
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium">
              Powered by Gemini + Google Search
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1.5 leading-none shadow-[0_0_8px_rgba(16,185,129,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Search Grounded
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        {/* Left side: Insider tips and core facts */}
        <div className="space-y-4">
          {/* Insider tips */}
          <div>
            <h4 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="text-sm">💡</span> Insider Tips & Strategies
            </h4>
            <div className="space-y-2">
              {research.insiderTips.map((tip, idx) => (
                <div 
                  key={idx} 
                  className="p-3 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/15 rounded-xl text-xs text-[var(--text-secondary)] leading-relaxed shadow-sm hover:bg-[var(--accent-primary)]/10 transition-colors"
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Key facts and insights */}
          <div>
            <h4 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="text-sm">📊</span> Grounded Target Insights
            </h4>
            <ol className="space-y-2">
              {research.keyFacts.map((fact, idx) => (
                <li 
                  key={idx} 
                  className="flex gap-2 text-xs text-[var(--text-secondary)] leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5"
                >
                  <span className="font-mono font-bold text-[var(--accent-secondary)]">{idx + 1}.</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right side: Clickable resources */}
        <div>
          <h4 className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="text-sm">🔗</span> Live Search Discoveries
          </h4>
          <div className="space-y-3">
            {research.topResources.map((res, idx) => (
              <a 
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
                className="block p-3 bg-black/30 border border-white/5 hover:border-[var(--accent-primary)]/40 rounded-xl transition-all duration-300 hover:bg-white/[0.01]"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <p className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-secondary)] transition-colors leading-tight line-clamp-1">
                    {res.title}
                  </p>
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border leading-none ${getResourceTypeColor(res.type)}`}>
                    {res.type}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-2">
                  {res.description}
                </p>
                <span className="text-[10px] font-bold text-[var(--accent-secondary)] hover:underline flex items-center gap-0.5 pointer-events-none">
                  Explore Reference Material <ArrowRight className="w-3 h-3 inline-block animate-pulse" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResearchIntelligence;
