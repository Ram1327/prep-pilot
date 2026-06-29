import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import HeroSection from "../layout/HeroSection";
import InputForm from "../InputForm";
import LoadingState from "../loading/LoadingState";

import { AgentStatus } from "../../types/agent";

interface NewStrategyViewProps {
  isGenerating: boolean;
  pipelineAgents: AgentStatus[];
  error: string | null;
  isShaking: boolean;
  onSubmit: (description: string) => void;
  onRetry: () => void;
}

export default function NewStrategyView({
  isGenerating,
  pipelineAgents,
  error,
  isShaking,
  onSubmit,
  onRetry,
}: NewStrategyViewProps) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {!isGenerating && <HeroSection />}
      {!isGenerating && (
        <section className="my-6">
          <InputForm
            onSubmit={onSubmit}
            isLoading={isGenerating}
            isShaking={isShaking}
          />
        </section>
      )}
      {isGenerating && (
        <section className="my-12">
          <LoadingState pipelineAgents={pipelineAgents} />
        </section>
      )}
      {error && (
        <section className="my-8 max-w-[600px] mx-auto w-full">
          <div className="card border-l-4 border-l-[var(--danger)] bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-xl flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-[var(--danger)] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Strategic Interruption</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={onRetry}
                className="px-5 py-2 rounded-xl bg-[var(--danger)]/15 hover:bg-[var(--danger)]/30 text-[var(--danger)] border border-[var(--danger)]/30 transition-all font-semibold text-xs flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Mission Compilation
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
