import React, { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface InputFormProps {
  onSubmit: (description: string) => void;
  isLoading: boolean;
  isShaking: boolean;
}

export default function InputForm({ onSubmit, isLoading, isShaking }: InputFormProps) {
  const [description, setDescription] = useState("");

  const examples = [
    { label: "System design interview in 4 days", text: "I have a Google systems design interview in 4 days. Need to prepare for scale, load balancers, caching, databases, and rate limiters." },
    { label: "Machine learning exam in 1 week", text: "Deep learning course final exam in 1 week. Topics include loss functions, transformers architecture, convolutional neural nets, and optimizers." },
    { label: "Product presentation to CEO tomorrow", text: "Product strategy slide deck review presentation with our CEO tomorrow afternoon. Need to practice storytelling, Q&A, and logistics." },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(description);
  };

  const handleExampleClick = (text: string) => {
    setDescription(text);
  };

  return (
    <form 
      id="prep-pilot-form"
      onSubmit={handleFormSubmit}
      className={`w-full max-w-[900px] mx-auto p-6 md:p-8 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] shadow-[0_4px_30px_rgba(0,0,0,0.2)] transition-all ${
        isShaking ? "animate-shake border-[var(--danger)]" : ""
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Label and Character Count */}
        <div className="flex justify-between items-center">
          <label 
            htmlFor="challenge-description" 
            className="text-sm font-semibold tracking-wide text-[var(--text-secondary)] uppercase"
          >
            Describe Your Challenge or Deadline
          </label>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {description.length} chars
          </span>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="challenge-description"
            className="w-full min-h-[120px] p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-all duration-300 text-sm md:text-base leading-relaxed resize-y"
            placeholder="I have a system design interview at Google in 4 days..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Example Quick-Select Chips */}
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Quick Start Examples
          </p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(example.text)}
                disabled={isLoading}
                className="text-xs md:text-sm px-4 py-2 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-secondary)] transition-all cursor-pointer whitespace-normal text-left"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate CTA Button */}
        <div className="flex justify-end mt-4">
          <button 
            type="submit"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-semibold text-sm tracking-wide shadow-[0_4px_14px_rgba(108,99,255,0.3)] hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isLoading ? 'Generating...' : 'Generate My Execution Strategy →'}
          </button>
        </div>
      </div>
    </form>
  );
}
