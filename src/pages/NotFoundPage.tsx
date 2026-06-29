import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center py-10 px-4 font-sans animate-fadeIn">
      <div 
        id="notfound-card"
        className="w-full max-w-[440px] p-8 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600" />
        
        <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6 mt-4">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 font-mono">
          404
        </h1>
        
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
          Page Not Found
        </h2>
        
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-8 px-4">
          The execution route you are trying to access doesn't exist, or has been relocated. Let's get you back on track.
        </p>

        <Link
          to="/"
          className="w-full py-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-semibold text-sm tracking-wide shadow-[0_4px_14px_rgba(108,99,255,0.25)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Strategy Room
        </Link>
      </div>
    </div>
  );
}
