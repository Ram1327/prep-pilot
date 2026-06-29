export interface AgentStatus {
  name: string;
  displayName: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  startTime?: number;
  endTime?: number;
  message?: string;
}

export interface PipelineProgress {
  currentAgent: string;
  agents: AgentStatus[];
  overallProgress: number; // 0-100
}

export interface DayStatus {
  dayIndex: number;
  status: 'complete' | 'missed';
  /** ISO date string (YYYY-MM-DD) of when the user marked this day */
  markedAt?: string;
}

export type IntegrationType = 'gmail' | 'meet' | 'calendar' | 'docs' | 'slides';

export interface PromptIntelligenceResult {
  /** Whether this is a simple reminder/todo or a real prep task requiring a full plan */
  taskCategory: 'simple_todo' | 'prep_task';
  /** The cleaned, context-enriched version of the user's raw prompt */
  enhancedPrompt: string;
  /** Human-readable explanation of what this task actually is */
  taskSummary: string;
  /** Which Google Workspace integrations are actually relevant for this task */
  requiredIntegrations: IntegrationType[];
  /** Why each integration was or wasn't selected */
  integrationRationale: string;
}

export interface IntakeResult {
  deadlineType: 'interview' | 'exam' | 'presentation' | 'project' | 'certification' | 'competition' | 'other';
  specificContext: string;
  daysAvailable: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  searchQueries: string[];
}

export interface PlanningResult {
  dailyPlan: Array<{
    day: number;
    theme: string;
    focus: string;
    tasks: string[];
    estimatedHours: number;
    checkpoint: string;
  }>;
  milestones: Array<{
    milestone: string;
    targetDay: number;
    successIndicator: string;
  }>;
  successChecklist: Array<{
    item: string;
    category: "Execution" | "Mindset" | "Logistics" | "Practice";
    isEssential: boolean;
  }>;
}

export interface ReasoningResult {
  strategyChoice: string;
  keyInsight: string;
  biggestRisk: string;
  adaptationNote: string;
}
