import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-[0.15em] gap-4 max-w-7xl mx-auto px-4 pb-10">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
        <span>PrepPilot • Built with Gemini AI</span>
        <div className="flex items-center gap-4 text-[var(--accent-secondary)] mt-1 sm:mt-0 font-sans font-semibold tracking-normal lowercase text-xs">
          <Link to="/" className="text-[var(--text-muted)] hover:text-white uppercase text-[10px] tracking-[0.15em] font-medium transition-colors">
            Home
          </Link>
          <span className="text-white/10">•</span>
          <Link to="/login" className="text-[var(--text-muted)] hover:text-white uppercase text-[10px] tracking-[0.15em] font-medium transition-colors">
            Login
          </Link>
          <span className="text-white/10">•</span>
          <Link to="/signup" className="text-[var(--text-muted)] hover:text-white uppercase text-[10px] tracking-[0.15em] font-medium transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
      <div className="font-mono text-center md:text-right">
        Vibe2Ship 2026 • v1.4.2
      </div>
    </footer>
  );
}
