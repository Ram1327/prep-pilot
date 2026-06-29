import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set on the server.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export async function callGeminiResilient(systemPrompt: string, userPrompt: string, responseSchema: any): Promise<any> {
  const primaryModel = "gemini-3.1-flash-lite"; // High-quota model first
  const backupModelFlash = "gemini-2.5-flash"; // Fallback standard model (fast)
  const backupModelPro = "gemini-2.5-pro"; // High-reasoning backup (slow)
  const modelsToTry = [primaryModel, backupModelFlash, backupModelPro];
  let lastError: any = null;
  const ai = getGeminiClient();

  for (const model of modelsToTry) {
    let attempt = 1;
    const maxRetries = 2; // Maximum 1 retry per model (2 total attempts)
    const baseDelayMs = 2000;

    while (attempt <= maxRetries) {
      try {
        console.log(`-> [callGeminiResilient] Requesting on model "${model}" (Attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        });
        
        const text = response.text;
        if (!text) {
          throw new Error("No response string or empty text returned from Gemini API");
        }
        return JSON.parse(text.trim());
      } catch (error: any) {
        lastError = error;
        console.error(`-> [callGeminiResilient] ERROR on model "${model}":`, error.message || error);
        const status = error?.status || error?.error?.code;
        const isQuotaError = status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota');
        const isOverloadError = status === 503 || error?.message?.includes('overloaded');
        
        if (isQuotaError) {
          console.warn(`[Pipeline Retry Handler] Quota/Rate limit encountered on model "${model}". Switching model immediately with no delay.`);
          break; // Switch to the next model immediately
        }
        
        if (isOverloadError && attempt < maxRetries) {
          console.warn(`[Pipeline Retry Handler] Model "${model}" overloaded. Waiting ${baseDelayMs}ms and retrying same model...`);
          await new Promise((resolve) => setTimeout(resolve, baseDelayMs));
          attempt++;
          continue;
        }
        
        console.warn(`[Pipeline Retry Handler] Model "${model}" failed. Moving to next candidate model...`);
        break; // Break and switch models
      }
    }
  }
  throw lastError || new Error("All loaded Gemini models failed to process request.");
}
