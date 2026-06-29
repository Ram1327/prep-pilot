import { Type } from "@google/genai";
import { callGeminiResilient } from "../lib/gemini";
import { PromptIntelligenceResult, IntegrationType } from "../../src/types/agent";

// Integration rules based on task type — used as context for the LLM
const INTEGRATION_RULES = `
Decide which integrations are genuinely useful for the user's task. Use these guidelines:

- **gmail**: Only if the task involves reaching out to someone (recruiter, mentor, manager, professor, client). 
  Examples: interview prep (email recruiter), project deadline (email team), NOT for personal exams.
  
- **meet**: Only if the task benefits from a live session — mock interview, team sync, mentor call, review meeting.
  Examples: interview prep (mock call), presentation rehearsal (feedback session). NOT for solo exam study.
  
- **calendar**: Almost always useful — block focused work time. Include for any task with a clear deadline.
  
- **docs**: Almost always useful — notes, cheat-sheets, outlines, reference materials. Include for most tasks.
  
- **slides**: Only if the task itself involves building or presenting slides.
  Examples: presentation deadline, pitch deck, demo day. NOT for exams or interviews (unless specifically a slide interview).

Examples:
- "exam in 3 days" → [calendar, docs]
- "coding interview at Google in 2 days" → [gmail, meet, calendar, docs]
- "product presentation to board next week" → [slides, calendar, docs]
- "project report due Friday" → [docs, calendar, gmail]
- "job interview in 4 days" → [gmail, meet, calendar, docs]
- "design sprint presentation tomorrow" → [slides, calendar]
- "certification exam in 10 days" → [calendar, docs]
- "team kickoff presentation next Monday" → [slides, meet, calendar]
`;

// Task category classification rules
const TASK_CATEGORY_RULES = `
## CRITICAL FIRST STEP: Classify the task category BEFORE doing anything else.

**taskCategory must be one of two values:**

### "simple_todo"
A simple reminder, chore, errand, or vague calendar event that requires NO multi-day preparation strategy.
These tasks only need a calendar reminder or a quick note — NOT a full prep plan.

Simple todo examples:
- "water my plants"
- "remind me to call mom"
- "buy groceries"
- "pick up dry cleaning"
- "dentist appointment tomorrow"
- "team meeting at 3pm" (no context about what to prepare)
- "I have a meet at 8pm" (vague, no preparation context)
- "haircut on Friday"
- "pay rent"
- "take medicine at night"
- "call the plumber"
- "birthday dinner tomorrow"
- "remind me about the standup"

### "prep_task"
A high-stakes event requiring structured multi-day preparation — something where coaching, research, a daily plan, and strategy are genuinely valuable.

Prep task examples:
- "job interview at Google in 3 days"
- "final exam next week"
- "board presentation on Thursday"
- "product launch in 5 days"
- "coding challenge tomorrow"
- "certification exam next month"
- "pitch to investors in 2 weeks"
- "design review with leadership"
- "hackathon this weekend"
- "marathon in 2 months"
- "public speaking event"

**KEY RULE**: If in doubt, classify as "simple_todo". Only classify as "prep_task" when preparation strategy would genuinely help.
**KEY RULE**: A meeting or appointment without any preparation context → "simple_todo"
**KEY RULE**: A personal errand, chore, or daily task → always "simple_todo"
`;

export async function runPromptIntelligenceAgent(rawPrompt: string): Promise<PromptIntelligenceResult> {
  const systemPrompt = `You are PrepPilot's Prompt Intelligence Agent. Your job is to:
1. Classify whether the user's input is a "simple_todo" (reminder/chore/vague appointment) or a "prep_task" (needs real preparation strategy)
2. Understand the user's casual, plain-English description of their upcoming deadline or task
3. Rewrite it as a clear, structured context paragraph that other AI agents can act on precisely
4. Select ONLY the Google Workspace integrations that are genuinely relevant for this specific task

${TASK_CATEGORY_RULES}

${INTEGRATION_RULES}

IMPORTANT OVERRIDES for simple_todo tasks:
- For simple_todo: requiredIntegrations should be ONLY ["calendar"] — just create a reminder event
- For simple_todo: enhancedPrompt should be a brief 1-sentence calendar reminder description
- For prep_task: proceed normally with the full integration selection logic

Be selective and smart — do NOT include integrations just because they could theoretically apply. 
Return ONLY raw JSON matching the specified response schema.`;

  const userPrompt = `Analyze this user task description:

"${rawPrompt.trim()}"

Step 1: Classify as "simple_todo" or "prep_task" using the category rules.
Step 2: Return the full response schema with taskCategory, enhancedPrompt, taskSummary, requiredIntegrations, and integrationRationale.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      taskCategory: {
        type: Type.STRING,
        description: "REQUIRED FIRST: Must be exactly 'simple_todo' or 'prep_task'. simple_todo = reminders/chores/vague appointments. prep_task = high-stakes events needing structured preparation."
      },
      enhancedPrompt: {
        type: Type.STRING,
        description: "A clear, enriched version of the prompt with full context for downstream agents (2-3 sentences). For simple_todo, keep to 1 sentence describing the calendar event."
      },
      taskSummary: {
        type: Type.STRING,
        description: "A concise 1-sentence summary of what this task is"
      },
      requiredIntegrations: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "Must be one of: gmail | meet | calendar | docs | slides"
        },
        description: "For simple_todo: ONLY ['calendar']. For prep_task: only the integrations genuinely useful for this specific task."
      },
      integrationRationale: {
        type: Type.STRING,
        description: "Brief explanation of the task category classification and which integrations were selected and why."
      }
    },
    required: ["taskCategory", "enhancedPrompt", "taskSummary", "requiredIntegrations", "integrationRationale"]
  };

  console.log("-> [Prompt Intelligence Agent] Analyzing user prompt and classifying task category...");
  const result = await callGeminiResilient(systemPrompt, userPrompt, responseSchema);
  
  // Validate taskCategory
  const taskCategory = result.taskCategory === 'simple_todo' ? 'simple_todo' : 'prep_task';
  console.log(`-> [Prompt Intelligence Agent] Task classified as: "${taskCategory}"`);

  // Validate and filter requiredIntegrations to only valid values
  const validIntegrations: IntegrationType[] = ['gmail', 'meet', 'calendar', 'docs', 'slides'];
  let filtered = (result.requiredIntegrations as string[]).filter(
    (i): i is IntegrationType => validIntegrations.includes(i as IntegrationType)
  );

  // For simple_todo: force integrations to calendar-only regardless of LLM output
  if (taskCategory === 'simple_todo') {
    filtered = ['calendar'];
    console.log("-> [Prompt Intelligence Agent] Simple todo detected — forcing calendar-only integration");
  } else {
    // For prep tasks: ensure at least calendar + docs as a sensible minimum
    if (filtered.length === 0) {
      filtered.push('calendar', 'docs');
      console.warn("-> [Prompt Intelligence Agent] No integrations selected — defaulting to calendar + docs");
    }
  }
  
  return {
    ...result,
    taskCategory,
    requiredIntegrations: filtered
  };
}
