import { Type } from "@google/genai";
import { getGeminiClient } from "../lib/gemini";
import { IntakeResult } from "../../src/types/agent";
import { ResearchResult } from "../../src/types/plan";

export async function runResearchAgent(intake: IntakeResult): Promise<ResearchResult & { wasGrounded: boolean; researchMethod: string }> {
  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-2.5-flash"];
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const modelToUse of modelsToTry) {
    console.log(`-> [Research Agent] Requesting standard execution synthesis on ${modelToUse}...`);
    let attempt = 1;
    const maxRetries = 2; // Maximum 1 retry per model (2 total attempts)
    const baseDelayMs = 2000;

    while (attempt <= maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: modelToUse,
          contents: `Provide expert execution resources for: ${intake.specificContext}
          
          Synthesize high-quality standard execution resources (using actual popular tutorial/documentation/practice URLs if possible), 
          along with key structural facts/patterns and advanced planning/execution tips for someone with ${intake.daysAvailable} days.
          Context area: ${intake.searchQueries.join(', ')}
          
          Return JSON matching response schema structure precisely with 5 keyFacts and 3 insiderTips.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                topResources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING, description: "Must be: course | article | practice | book | video" },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "description", "type", "url"]
                  }
                },
                keyFacts: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specify exactly 5 key facts, insights, patterns, or trends about this deadline topic"
                },
                insiderTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specify exactly 3 hyper-targeted insider tips or specialized hacks"
                }
              },
              required: ["topResources", "keyFacts", "insiderTips"]
            }
          }
        });

        const text = response.text;
        if (!text) {
          throw new Error("No response string or empty text returned from Gemini API");
        }
        const parsed = JSON.parse(text.trim());
        return {
          ...parsed,
          wasGrounded: false,
          researchMethod: "gemini-knowledge"
        };
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.error?.code;
        const isQuotaError = status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota');
        const isOverloadError = status === 503 || error?.message?.includes('overloaded');

        if (isQuotaError) {
          console.warn(`[Research Agent] Quota/Rate limit error on model "${modelToUse}". Switching model immediately with no delay.`);
          break; // Switch to next candidate immediately
        }

        if (isOverloadError && attempt < maxRetries) {
          console.warn(`[Research Agent] Model "${modelToUse}" overloaded. Waiting ${baseDelayMs}ms and retrying same model...`);
          await new Promise((resolve) => setTimeout(resolve, baseDelayMs));
          attempt++;
          continue;
        }

        console.warn(`[Research Agent] Model "${modelToUse}" failed. Moving to next candidate...`);
        break;
      }
    }
  }
  throw lastError || new Error("All fallback options for Research Agent failed.");
}
