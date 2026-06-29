import { DayStatus } from "./agent";
export type { DayStatus };

export interface TimeAvailable {
  totalDays: number;
  hoursPerDay?: number;
  totalHours: number;
  intensity: "Light" | "Moderate" | "Intensive" | "Critical";
  urgencyMessage: string;
}

export interface DayPlan {
  day: number;
  date?: string;
  theme: string;
  focus: string;
  tasks: string[];
  estimatedHours: number;
  checkpoint: string;
  isAdapted?: boolean;
  adaptationNote?: string;
}

// Alias for flexibility in refactoring
export type DailyPlanItem = DayPlan;

export interface KeyTopic {
  topic: string;
  importance: "Critical" | "High" | "Medium";
  whyItMatters: string;
  resources: string[];
}

export interface Milestone {
  milestone: string;
  targetDay: number;
  successIndicator: string;
}

export interface SuccessChecklistItem {
  item: string;
  category: "Execution" | "Mindset" | "Logistics" | "Practice";
  isEssential: boolean;
}

export type ChecklistItem = SuccessChecklistItem;

export interface AgentReasoning {
  strategyChoice: string;
  keyInsight: string;
  biggestRisk: string;
  adaptationNote: string;
}

export interface ResearchResource {
  title: string;
  description: string;
  type: "course" | "article" | "practice" | "book" | "video";
  url: string;
}

export interface ResearchResult {
  topResources: ResearchResource[];
  keyFacts: string[];
  insiderTips: string[];
}

export interface TopicMaterials {
  summary: string;
  practiceQuestions: Array<{ question: string; answer: string; difficulty: string }>;
  cheatSheet: string[];
}

export interface ReplanResponse {
  revisedDays: DayPlan[];
  replanSummary: string;
}

export interface PrepPlan {
  goalSummary: string;
  timeAvailable: TimeAvailable;
  dailyPlan: DayPlan[];
  keyTopics: KeyTopic[];
  milestones: Milestone[];
  successChecklist: SuccessChecklistItem[];
  agentReasoning: AgentReasoning;
  research?: ResearchResult;
  smartActions?: ActionResult;
  pipelineMetadata?: {
    agentsRun: string[];
    researchGrounded?: boolean;
    version: string;
    deadlineType?: string;
  };
}

export interface PrepTask {
  id: string;              // unique ID: Date.now().toString()
  title: string;           // first 45 chars of description, truncated with "..."
  description: string;     // full original prompt text
  deadlineType: string;    // from intake agent result (interview/exam/etc.)
  createdAt: string;       // ISO timestamp string
  updatedAt?: string;      // ISO timestamp string for sync LWW
  plan: PrepPlan;          // the full generated plan result
  dayStatuses: DayStatus[]; // progress tracking for each day
  checklistStatuses?: Record<string, boolean>; // checklist item states
  integrationHistory?: IntegrationHistoryItem[]; // execution history for integrations
}

export interface IntegrationHistoryItem {
  id: string;            // unique ID (e.g. timestamp or random)
  type: 'gmail' | 'meet' | 'calendar' | 'docs' | 'slides';
  executedAt: string;    // ISO timestamp
  resultUrl: string;     // URL to the created Workspace asset
  resultLabel: string;   // Action link text
  customPrompt?: string; // Optional refinement prompt used
}


export type SmartAction =
  | { id: string; type: 'gmail'; title: string; description: string; priority: 'high' | 'medium' | 'low'; prefilled: GmailPrefill; }
  | { id: string; type: 'calendar'; title: string; description: string; priority: 'high' | 'medium' | 'low'; prefilled: CalendarPrefill; }
  | { id: string; type: 'meet'; title: string; description: string; priority: 'high' | 'medium' | 'low'; prefilled: MeetPrefill; }
  | { id: string; type: 'docs'; title: string; description: string; priority: 'high' | 'medium' | 'low'; prefilled: DocsPrefill; }
  | { id: string; type: 'slides'; title: string; description: string; priority: 'high' | 'medium' | 'low'; prefilled: SlidesPrefill; };
export interface GmailPrefill {
  to: string;
  subject: string;
  body: string;
}
export interface CalendarPrefill {
  title: string;
  startTime: string;
  endTime: string;
  description: string;
}
export interface MeetPrefill {
  title: string;
  startTime: string;
  duration: number;
  attendees: string[];
}
export interface DocsPrefill {
  title: string;
  content: string;
}
export interface SlidesPrefill {
  title: string;
  slides: Array<{ title: string; bullets: string[] }>;
}
export interface ActionResult {
  actions: SmartAction[];
}


