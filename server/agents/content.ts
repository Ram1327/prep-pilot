import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { TopicMaterials } from "../../src/types/plan";

export async function runContentAgent(
  topic: string,
  context: string,
  importance: string
): Promise<TopicMaterials> {
  const prompt = `You are PrepPilot's Content Agent. Generate focused reference materials for:
Topic: ${topic}
Context: ${context}
Importance: ${importance}
Return ONLY raw JSON matching the specified schema structure precisely.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: "A clear, dense 200-word explanation of this topic with key concepts highlighted" },
      practiceQuestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            difficulty: { type: Type.STRING, description: "Must be: Easy | Medium | Hard" }
          },
          required: ["question", "answer", "difficulty"]
        }
      },
      cheatSheet: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Exactly 5 key point strings"
      }
    },
    required: ["summary", "practiceQuestions", "cheatSheet"]
  };

  return await callGeminiResilient(
    "You are PrepPilot's Content Agent producing strict JSON reference materials.",
    prompt,
    responseSchema
  );
}
