import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { IntakeResult } from "../../src/types/agent";
import { PrepPlan, AgentReasoning, ResearchResult } from "../../src/types/plan";

export async function runReasoningAgent(intake: IntakeResult, plan: PrepPlan, research: ResearchResult): Promise<AgentReasoning> {
  const systemPrompt = `You are the PrepPilot Strategy and Reasoning Agent. Your sole task is to formulate metacognitive reasoning explainers justifying the execution strategy, defining its critical single risk, identifying key insights, and recommending adaptation strategies.
Based on these research findings: ${JSON.stringify(research.keyFacts)}, explain your execution strategy.`;

  const userPrompt = `Formulate explanation metrics for context type: "${intake.deadlineType}" involving ${intake.daysAvailable} days execution timeline, summarized as "${intake.specificContext}".
Here is the target plan's summary: "${plan.goalSummary}".
And here are the researched insider tips: ${JSON.stringify(research.insiderTips)}.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      strategyChoice: { type: Type.STRING, description: "Why this specific execution strategy was chosen over alternatives, grounded in the research findings" },
      keyInsight: { type: Type.STRING, description: "The most important insight about this specific deadline type" },
      biggestRisk: { type: Type.STRING, description: "The most likely failure mode and how the plan addresses it" },
      adaptationNote: { type: Type.STRING, description: "How to adapt this plan if falling behind schedule" }
    },
    required: ["strategyChoice", "keyInsight", "biggestRisk", "adaptationNote"]
  };

  console.log("-> [Agent Run] Launching Reasoning Agent...");
  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}
