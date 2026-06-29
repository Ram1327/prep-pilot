import React from "react";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="w-full text-center py-8 md:py-12 flex flex-col items-center">
      {/* AI Token Badge */}
      <div 
        id="hero-badge"
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-accent)] shadow-[0_0_15px_rgba(108,99,255,0.08)] mb-6 float-animation transition-all animate-fadeIn"
      >
        <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
        <span className="text-xs font-semibold tracking-wide uppercase bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
          AI-Powered Execution Agent
        </span>
      </div>

      {/* Main Hero Headline */}
      <h1 
        id="hero-headline"
        className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] max-w-2xl leading-tight mb-4 font-sans"
      >
        From Deadline to{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-400 to-teal-400">
          Done.
        </span>
      </h1>

      {/* Subtitle */}
      <p 
        id="hero-subtitle"
        className="text-sm md:text-base text-[var(--text-secondary)] max-w-xl mx-auto font-light leading-relaxed px-4"
      >
        Describe your upcoming challenge. PrepPilot builds your complete execution strategy.
      </p>
    </div>
  );
}
