import { DayPlan } from '../types/plan';

export interface ReplanRequest {
  originalContext: string;
  daysAvailable: number;
  urgencyLevel: string;
  missedTopics: string;
  remainingPlan: DayPlan[];
  keyTopics: any[];
}

export interface ReplanResponse {
  revisedDays: DayPlan[];
  replanSummary: string;
}

export interface TopicMaterialsRequest {
  topic: string;
  context: string;
  importance: string;
}

export interface TopicMaterialsResponse {
  summary: string;
  practiceQuestions: Array<{ question: string; answer: string; difficulty: string }>;
  cheatSheet: string[];
}

export const api = {
  generatePlanStream: (description: string): EventSource => {
    return new EventSource(`/api/generate-plan-stream?description=${encodeURIComponent(description)}`);
  },
  
  replan: async (payload: ReplanRequest): Promise<ReplanResponse> => {
    const res = await fetch('/api/replan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Replan failed: ${res.status}`);
    return res.json();
  },
  
  generateTopicMaterials: async (payload: TopicMaterialsRequest): Promise<TopicMaterialsResponse> => {
    const res = await fetch('/api/topic-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Topic materials failed: ${res.status}`);
    return res.json();
  },
};
