import React from "react";
import { PrepTask, DayStatus, ActionResult, IntegrationHistoryItem } from "../../types/plan";
import { getDeadlineEmoji } from "../layout/Sidebar";

// Plan sub-components
import MissionBrief from "../plan/MissionBrief";
import TimeAnalysis from "../plan/TimeAnalysis";
import DailyBattlePlan from "../plan/DailyBattlePlan";
import ResearchIntelligence from "../plan/ResearchIntelligence";
import SmartActions from "../plan/SmartActions";
import Milestones from "../plan/Milestones";
import SuccessChecklist from "../plan/SuccessChecklist";
import AgentReasoning from "../plan/AgentReasoning";

interface StrategyDetailViewProps {
  displayTask: PrepTask;
  sharedPlanData: any | null;
  user: any;
  dayStatuses: DayStatus[];
  isReplanning: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  handleSharePlan: () => void;
  onImportPlan: () => void;
  onMarkComplete: (dayIdx: number) => void;
  onMarkMissed: (dayIdx: number) => void;
  onActionsGenerated: (actions: ActionResult) => void;
  onToggleChecklist: (updatedChecklist: Record<string, boolean>) => void;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  addIntegrationHistory: (taskId: string, item: Omit<IntegrationHistoryItem, 'id' | 'executedAt'>) => Promise<void>;
}

export default function StrategyDetailView({
  displayTask,
  sharedPlanData,
  user,
  dayStatuses,
  isReplanning,
  googleAccessToken,
  signInWithGoogle,
  handleSharePlan,
  onImportPlan,
  onMarkComplete,
  onMarkMissed,
  onActionsGenerated,
  onToggleChecklist,
  resultsRef,
  addIntegrationHistory,
}: StrategyDetailViewProps) {
  return (
    <div className="max-w-[900px] mx-auto w-full flex flex-col gap-6" ref={resultsRef}>
      {/* Shared Plan Preview Top Banner */}
      {sharedPlanData && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-extrabold text-purple-400">SHARED STRATEGY PREVIEW</span>
            <h4 className="text-xs text-[var(--text-secondary)] mt-0.5">You are previewing a strategic roadmap shared with you.</h4>
          </div>
          <button
            onClick={onImportPlan}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            + Import to My Strategies
          </button>
        </div>
      )}

      {/* Task Header */}
      <div 
        className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(99,102,241,0.03)] hover:border-indigo-500/30 transition-all duration-300"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl shrink-0">{getDeadlineEmoji(displayTask.deadlineType)}</span>
          <div>
            <div className="text-[11px] text-slate-400 mb-0.5 uppercase tracking-wider font-semibold font-mono">
              {sharedPlanData ? "SHARED STRATEGY" : "ACTIVE STRATEGY"}
            </div>
            <div className="text-[15px] font-bold text-slate-100 leading-relaxed font-sans">
              {displayTask.description || displayTask.title}
            </div>
          </div>
        </div>

        {!sharedPlanData && user && (
          <button
            onClick={handleSharePlan}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[rgba(108,99,255,0.3)] hover:bg-[rgba(108,99,255,0.15)] text-xs font-semibold text-[#a78bfa] gap-1 flex items-center transition-all cursor-pointer h-fit"
          >
            🔗 Share Strategy
          </button>
        )}
      </div>

      {/* All plan result cards */}
      <MissionBrief goalSummary={displayTask.plan.goalSummary} />
      
      <TimeAnalysis timeAvailable={displayTask.plan.timeAvailable} createdAt={displayTask.createdAt} />
      
      <DailyBattlePlan
        dailyPlan={displayTask.plan.dailyPlan}
        dayStatuses={dayStatuses}
        onMarkComplete={onMarkComplete}
        onMarkMissed={onMarkMissed}
        isReplanning={isReplanning}
      />

      {displayTask.plan.research && (
        <ResearchIntelligence research={displayTask.plan.research} />
      )}

      <SmartActions
        smartActions={displayTask.plan.smartActions}
        plan={displayTask.plan}
        googleAccessToken={googleAccessToken}
        signInWithGoogle={signInWithGoogle}
        onActionsGenerated={onActionsGenerated}
        addIntegrationHistory={addIntegrationHistory}
        integrationHistory={displayTask.integrationHistory || []}
      />

      <Milestones milestones={displayTask.plan.milestones} />

      <SuccessChecklist 
        successChecklist={displayTask.plan.successChecklist} 
        checklistStatuses={displayTask.checklistStatuses}
        onToggleChecklist={onToggleChecklist}
      />

      <AgentReasoning
        agentReasoning={displayTask.plan.agentReasoning}
        pipelineMetadata={displayTask.plan.pipelineMetadata}
        pipelineAgents={[]}
      />
    </div>
  );
}
