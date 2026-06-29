import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { IntakeResult } from "../../src/types/agent";

export async function runIntakeAgent(description: string): Promise<IntakeResult> {
  const systemPrompt = `You are the Intake Agent. Parse this deadline description and extract structured metadata.
Return JSON only. Generate 3 specific Google Search queries that would find the most useful execution resources for this exact situation.`;
  const userPrompt = `Classify this description into an intake metadata object:\n\n"${description.trim()}"`;
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      deadlineType: { 
        type: Type.STRING, 
        description: "Must be exactly one of: interview | exam | presentation | project | certification | competition | other" 
      },
      specificContext: {
        type: Type.STRING,
        description: "Must specify context of prep required, e.g. 'Google system design interview'"
      },
      daysAvailable: { 
        type: Type.INTEGER, 
        description: "Specify the exact or estimated count of days until the deadline. If not specified or ambiguous, default to 7." 
      },
      urgencyLevel: {
        type: Type.STRING,
        description: "Must be exactly one of: low | medium | high | critical"
      },
      searchQueries: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Generate exactly 3 extremely clear targeted search queries"
      }
    },
    required: ["deadlineType", "specificContext", "daysAvailable", "urgencyLevel", "searchQueries"]
  };

  console.log("-> [Agent Run] Launching Intake Agent...");
  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}
