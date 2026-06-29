import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { IntakeResult } from "../../src/types/agent";
import { PrepPlan, ActionResult, SmartAction } from "../../src/types/plan";

// Action Sub-Agent A: COMMUNICATION — Gmail + Meet
export async function runActionAgentA(intake: IntakeResult, plan: PrepPlan): Promise<ActionResult> {
  const systemPrompt = `You are PrepPilot's Communication Action Agent.
Generate exactly 2 Google Workspace actions:
1. ONE "gmail" action: a concise draft email to a mentor, manager, recruiter, or accountability partner. Keep body to 3-4 sentences.
2. ONE "meet" action: a Google Meet session for a mock run-through, review, or feedback session.
For Gmail: if you cannot determine a real recipient email, use the label as the 'to' field (e.g. "mentor@example.com").
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Context: ${intake.specificContext}
Days available: ${intake.daysAvailable}
Urgency: ${intake.urgencyLevel}
Plan themes: ${plan.dailyPlan.map(d => d.theme).join(', ')}
Generate exactly 2 actions: one gmail and one meet.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      actions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, description: "Must be exactly one of: gmail | meet" },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, description: "Must be: high | medium | low" },
            prefilled: {
              type: Type.OBJECT,
              properties: {
                to: { type: Type.STRING, description: "Recipient email. Set to empty string if not applicable." },
                subject: { type: Type.STRING, description: "Email subject. Set to empty string if not applicable." },
                body: { type: Type.STRING, description: "Email body text. Set to empty string if not applicable." },
                title: { type: Type.STRING, description: "Meeting title. Set to empty string if not applicable." },
                startTime: { type: Type.STRING, description: "Meeting start time ISO 8601. Set to empty string if not applicable." },
                duration: { type: Type.INTEGER, description: "Meeting duration in minutes. Set to 0 if not applicable." },
                attendees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Attendee email list. Set to empty array if not applicable." }
              },
              required: ["to", "subject", "body", "title", "startTime", "duration", "attendees"]
            }
          },
          required: ["id", "type", "title", "description", "priority", "prefilled"]
        }
      }
    },
    required: ["actions"]
  };

  console.log("-> [Action Sub-Agent A] Launching Communication Agent (Gmail + Meet)...");
  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

// Action Sub-Agent B: PLANNING — Calendar + Docs
export async function runActionAgentB(intake: IntakeResult, plan: PrepPlan): Promise<ActionResult> {
  const systemPrompt = `You are PrepPilot's Planning Action Agent.
Generate exactly 2 Google Workspace actions:
1. ONE "calendar" action: block a single primary focus time window (e.g., 2pm-5pm). Use ISO 8601 for startTime/endTime. Keep description to 1-2 sentences.
2. ONE "docs" action: a concise reference cheatsheet outline (max 150 words for content).
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Context: ${intake.specificContext}
Days available: ${intake.daysAvailable}
Urgency: ${intake.urgencyLevel}
Plan themes: ${plan.dailyPlan.map(d => d.theme).join(', ')}
Generate exactly 2 actions: one calendar and one docs.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      actions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, description: "Must be exactly one of: calendar | docs" },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, description: "Must be: high | medium | low" },
            prefilled: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Event/Document title. Set to empty string if not applicable." },
                startTime: { type: Type.STRING, description: "Event start time ISO 8601. Set to empty string if not applicable." },
                endTime: { type: Type.STRING, description: "Event end time ISO 8601. Set to empty string if not applicable." },
                description: { type: Type.STRING, description: "Event description. Set to empty string if not applicable." },
                content: { type: Type.STRING, description: "Document cheatsheet outline content. Set to empty string if not applicable." }
              },
              required: ["title", "startTime", "endTime", "description", "content"]
            }
          },
          required: ["id", "type", "title", "description", "priority", "prefilled"]
        }
      }
    },
    required: ["actions"]
  };

  console.log("-> [Action Sub-Agent B] Launching Planning Agent (Calendar + Docs)...");
  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

// Action Sub-Agent C: PRESENTATION — Slides
export async function runActionAgentC(intake: IntakeResult, plan: PrepPlan): Promise<ActionResult> {
  const systemPrompt = `You are PrepPilot's Presentation Action Agent.
Generate exactly 1 Google Workspace action:
1. ONE "slides" action: a strategic overview presentation. Generate EXACTLY 3 slides (Title slide, Key Areas slide, Action Plan slide). Each slide has a title and 3-4 brief bullet points.
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Context: ${intake.specificContext}
Days available: ${intake.daysAvailable}
Plan themes: ${plan.dailyPlan.map(d => d.theme).join(', ')}
Generate exactly 1 action: one slides presentation.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      actions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, description: "Must be: slides" },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, description: "Must be: high | medium | low" },
            prefilled: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Brief title of the presentation (maximum 6 words)" },
                slides: {
                  type: Type.ARRAY,
                  description: "Array of exactly 3 slides",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "Slide title" },
                      bullets: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 concise bullet points" }
                    },
                    required: ["title", "bullets"]
                  }
                }
              },
              required: ["title", "slides"]
            }
          },
          required: ["id", "type", "title", "description", "priority", "prefilled"]
        }
      }
    },
    required: ["actions"]
  };

  console.log("-> [Action Sub-Agent C] Launching Presentation Agent (Slides)...");
  return await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
}

export async function runActionAgentsParallel(intake: IntakeResult, plan: PrepPlan): Promise<ActionResult> {
  console.log("-> [Action Pipeline] Launching 3 Action Sub-Agents in parallel (staggered)...");
  
  const runA = runActionAgentA(intake, plan);
  await new Promise(resolve => setTimeout(resolve, 200));
  const runB = runActionAgentB(intake, plan);
  await new Promise(resolve => setTimeout(resolve, 200));
  const runC = runActionAgentC(intake, plan);

  const [commResult, planResult, presResult] = await Promise.allSettled([
    runA,
    runB,
    runC,
  ]);

  const allActions: SmartAction[] = [
    ...(commResult.status === 'fulfilled' ? commResult.value.actions : []),
    ...(planResult.status === 'fulfilled' ? planResult.value.actions : []),
    ...(presResult.status === 'fulfilled' ? presResult.value.actions : []),
  ];

  if (commResult.status === 'rejected') console.warn("-> [Action Sub-Agent A] FAILED:", commResult.reason);
  if (planResult.status === 'rejected') console.warn("-> [Action Sub-Agent B] FAILED:", planResult.reason);
  if (presResult.status === 'rejected') console.warn("-> [Action Sub-Agent C] FAILED:", presResult.reason);

  console.log(`-> [Action Pipeline] Complete. ${allActions.length}/5 actions generated.`);
  return { actions: allActions as any };
}
