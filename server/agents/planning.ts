import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { IntakeResult } from "../../src/types/agent";
import { PrepPlan } from "../../src/types/plan";

export async function runPlanningAgent(intake: IntakeResult): Promise<PrepPlan> {
  const systemPrompt = `You are the PrepPilot Planning Agent. Using the categorized intake metadata (Days available: ${intake.daysAvailable}, Type: ${intake.deadlineType}, Context: ${intake.specificContext}, Urgency: ${intake.urgencyLevel}), construct a complete and rigorous execution strategy, checklist, key focus areas, milestones, and a structured day-by-day action sequence.
Make sure Day numbers in dailyPlan strictly count up sequentially (e.g., Day 1, Day 2, etc.) matching totalDays.
Calculate daily execution details based on intensity levels:
- Critical: 5-6 hours per day
- Intensive: 4-5 hours per day
- Moderate: 2-3 hours per day
- Light: 1-2 hours per day`;

  const userPrompt = `Formulate a complete execution strategy for a "${intake.deadlineType}" deadline over ${intake.daysAvailable} days.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      goalSummary: { 
        type: Type.STRING,
        description: "One paragraph that reframes the user's goal into a clear mission statement with emotional stakes and what success looks like"
      },
      timeAvailable: {
        type: Type.OBJECT,
        properties: {
          totalDays: { type: Type.INTEGER, description: "Exact number of days from intake metadata" },
          hoursPerDay: { type: Type.NUMBER, description: "Recommended focused action hours per day based on intensity level selected: Critical=5-6, Intensive=4-5, Moderate=2-3, Light=1-2" },
          totalHours: { type: Type.INTEGER, description: "totalDays multiplied by hoursPerDay" },
          intensity: { 
            type: Type.STRING, 
            description: "Must be exactly one of: Light | Moderate | Intensive | Critical" 
          },
          urgencyMessage: { 
            type: Type.STRING,
            description: "One sentence summarizing what this timeline level entails"
          }
        },
        required: ["totalDays", "hoursPerDay", "totalHours", "intensity", "urgencyMessage"]
      },
      dailyPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            date: { 
              type: Type.STRING,
              description: "e.g. 'Day 1', 'Day 2', etc."
            },
            theme: { 
              type: Type.STRING,
              description: "Short theme name for this day e.g. Foundation Building"
            },
            focus: { 
              type: Type.STRING,
              description: "Primary focus area"
            },
            tasks: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Exactly 3 specific detailed actionable tasks for the user"
            },
            estimatedHours: { type: Type.INTEGER },
            checkpoint: { 
              type: Type.STRING,
              description: "What completing this day successfully looks like"
            }
          },
          required: ["day", "date", "theme", "focus", "tasks", "estimatedHours", "checkpoint"]
        }
      },
      keyTopics: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: "Topic name" },
            importance: { 
              type: Type.STRING,
              description: "Must be exactly one of: Critical | High | Medium"
            },
            whyItMatters: { type: Type.STRING, description: "One sentence explanation" },
            resources: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Specific resource titles, links or execution approach guidelines"
            }
          },
          required: ["topic", "importance", "whyItMatters", "resources"]
        }
      },
      milestones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            milestone: { type: Type.STRING, description: "Milestone description" },
            targetDay: { type: Type.INTEGER, description: "Target day number to achieve this milestone" },
            successIndicator: { type: Type.STRING, description: "How to know you've achieved this" }
          },
          required: ["milestone", "targetDay", "successIndicator"]
        }
      },
      successChecklist: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING, description: "Checklist item" },
            category: { 
              type: Type.STRING,
              description: "Must be exactly one of: Execution | Mindset | Logistics | Practice"
            },
            isEssential: { type: Type.BOOLEAN, description: "Whether this item is absolutely essential (stars it)" }
          },
          required: ["item", "category", "isEssential"]
        }
      }
    },
    required: [
      "goalSummary",
      "timeAvailable",
      "dailyPlan",
      "keyTopics",
      "milestones",
      "successChecklist"
    ]
  };

  console.log("-> [Agent Run] Launching Planning Agent...");
  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}
