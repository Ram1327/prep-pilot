import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { ReplanResponse } from "../../src/types/plan";

export async function runMonitorAgent(
  originalContext: string,
  daysAvailable: number,
  urgencyLevel: string,
  missedTopics: string,
  remainingPlan: any,
  keyTopics: any[]
): Promise<ReplanResponse> {
  const prompt = `You are PrepPilot's Monitor Agent. A user missed an action day and needs their remaining strategy compressed.
Context: ${originalContext}
Days remaining: ${daysAvailable}
Urgency: ${urgencyLevel}
Topics from missed day to incorporate: ${missedTopics}
Key topics still needed: ${keyTopics ? keyTopics.map((t: any) => t.topic).join(', ') : ''}
Original remaining plan: ${JSON.stringify(remainingPlan)}
Create a revised compressed execution strategy that:
1. Incorporates the most critical elements from the missed day into the remaining ${daysAvailable} days
2. Prioritizes the highest-impact topics given the reduced timeline
3. Is realistic and achievable given the compressed schedule
4. Marks each day with a "⚡ Adapted" note
Return ONLY raw JSON matching the specified schema.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      revisedDays: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            theme: { type: Type.STRING },
            focus: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedHours: { type: Type.NUMBER },
            checkpoint: { type: Type.STRING },
            isAdapted: { type: Type.BOOLEAN },
            adaptationNote: { type: Type.STRING }
          },
          required: ["day", "theme", "focus", "tasks", "estimatedHours", "checkpoint", "isAdapted", "adaptationNote"]
        }
      },
      replanSummary: { type: Type.STRING }
    },
    required: ["revisedDays", "replanSummary"]
  };

  return await callGeminiResilient(
    "You are PrepPilot's Monitor Agent producing strict JSON response schema.",
    prompt,
    responseSchema
  );
}
