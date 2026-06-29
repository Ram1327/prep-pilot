import { Router } from "express";
import { runPromptIntelligenceAgent } from "../agents/promptIntelligence";
import { runIntakeAgent } from "../agents/intake";
import { runPlanningAgent } from "../agents/planning";
import { runResearchAgent } from "../agents/research";
import { runReasoningAgent } from "../agents/reasoning";
import { runActionAgentA, runActionAgentB, runActionAgentC } from "../agents/action";
import { SmartAction, ActionResult } from "../../src/types/plan";
import { IntegrationType } from "../../src/types/agent";

const router = Router();
const inFlightRequests = new Map<string, boolean>();
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines which action sub-agents to run based on selected integrations:
 * - Agent A: gmail + meet (Communication)
 * - Agent B: calendar + docs (Planning)
 * - Agent C: slides (Presentation)
 */
function selectActionAgents(requiredIntegrations: IntegrationType[]) {
  const needs = new Set(requiredIntegrations);
  return {
    needsAgentA: needs.has('gmail') || needs.has('meet'),
    needsAgentB: needs.has('calendar') || needs.has('docs'),
    needsAgentC: needs.has('slides'),
  };
}

// GET endpoint at /api/generate-plan-stream for real-time progress updates (SSE)
router.get('/generate-plan-stream', async (req, res) => {
  const description = req.query.description as string;
  
  if (!description || typeof description !== "string") {
    return res.status(400).json({ error: "Description must be a valid string." });
  }

  if (description.trim().length < 10) {
    return res.status(400).json({
      error: "Your deadline description is too short (minimum 10 characters). Please provide more details about your upcoming challenge."
    });
  }

  // Create a fingerprint of this request
  const requestKey = `${description.trim().toLowerCase().slice(0, 100)}`;
  // If this exact description is already being processed, reject
  if (inFlightRequests.get(requestKey)) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.flushHeaders();
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'A plan for this input is already being generated. Please wait.' })}\n\n`);
    res.end();
    return;
  }
  
  // Mark as in-flight
  inFlightRequests.set(requestKey, true);
  const cleanup = () => inFlightRequests.delete(requestKey);
  req.on('close', cleanup);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  
  try {
    // Step 0: Prompt Intelligence — understand & select integrations
    sendEvent('agent-start', { agent: 'prompt-intelligence', message: 'Understanding your task and selecting integrations...' });
    const promptIntel = await runPromptIntelligenceAgent(description);
    sendEvent('agent-complete', { 
      agent: 'prompt-intelligence', 
      result: {
        taskSummary: promptIntel.taskSummary,
        requiredIntegrations: promptIntel.requiredIntegrations,
        integrationRationale: promptIntel.integrationRationale
      }
    });
    console.log(`-> [Prompt Intelligence] Selected integrations: [${promptIntel.requiredIntegrations.join(', ')}]`);
    console.log(`-> [Prompt Intelligence] Rationale: ${promptIntel.integrationRationale}`);

    await sleep(400);

    // ── SIMPLE TODO FAST PATH ────────────────────────────────────────────────
    // If the task is a simple reminder/chore, skip the full 5-agent pipeline.
    // Just return a lightweight calendar action — no daily plan needed.
    if (promptIntel.taskCategory === 'simple_todo') {
      console.log(`-> [Plan Route] Simple todo detected — emitting simple_task event and exiting pipeline early.`);
      sendEvent('simple_task', {
        taskSummary: promptIntel.taskSummary,
        enhancedPrompt: promptIntel.enhancedPrompt,
        integrationRationale: promptIntel.integrationRationale,
      });
      res.end();
      return;
    }
    // ── END FAST PATH ─────────────────────────────────────────────────────────

    // Step 1: Intake — use enhanced prompt for richer context
    sendEvent('agent-start', { agent: 'intake', message: 'Analyzing your deadline details...' });
    const intake = await runIntakeAgent(promptIntel.enhancedPrompt);
    sendEvent('agent-complete', { agent: 'intake', result: intake });
    
    await sleep(600);
    
    // Step 2: Planning + Research in parallel
    sendEvent('agent-start', { agent: 'planning', message: 'Building your customized execution strategy...' });
    sendEvent('agent-start', { agent: 'research', message: 'Analyzing relevant execution resources...' });
    
    const [plan, research] = await Promise.all([
      runPlanningAgent(intake),
      runResearchAgent(intake)
    ]);
    
    sendEvent('agent-complete', { agent: 'planning' });
    sendEvent('agent-complete', { agent: 'research', result: research });
    
    await sleep(600);
    
    // Step 3: Reasoning
    sendEvent('agent-start', { agent: 'reasoning', message: 'Generating strategic insights and recommendations...' });
    const reasoning = await runReasoningAgent(intake, plan, research);
    sendEvent('agent-complete', { agent: 'reasoning' });
    
    await sleep(600);

    // Step 4: Selective action sub-agents based on required integrations
    const { needsAgentA, needsAgentB, needsAgentC } = selectActionAgents(promptIntel.requiredIntegrations);
    
    if (needsAgentA) sendEvent('agent-start', { agent: 'actions-a', message: 'Drafting Gmail & Meet integrations...' });
    if (needsAgentB) sendEvent('agent-start', { agent: 'actions-b', message: 'Blocking Calendar & building Docs...' });
    if (needsAgentC) sendEvent('agent-start', { agent: 'actions-c', message: 'Building Slides presentation...' });
    
    // Skip agents that aren't needed — stagger the ones that are
    const agentPromises: Promise<any>[] = [];
    let agentAPromise: Promise<any> | null = null;
    let agentBPromise: Promise<any> | null = null;
    let agentCPromise: Promise<any> | null = null;

    if (needsAgentA) {
      agentAPromise = runActionAgentA(intake, plan);
      agentPromises.push(agentAPromise);
      await sleep(200);
    }
    if (needsAgentB) {
      agentBPromise = runActionAgentB(intake, plan);
      agentPromises.push(agentBPromise);
      await sleep(200);
    }
    if (needsAgentC) {
      agentCPromise = runActionAgentC(intake, plan);
      agentPromises.push(agentCPromise);
    }

    const [aResult, bResult, cResult] = await Promise.allSettled([
      agentAPromise ?? Promise.resolve(null),
      agentBPromise ?? Promise.resolve(null),
      agentCPromise ?? Promise.resolve(null),
    ]);

    if (needsAgentA) sendEvent('agent-complete', { agent: 'actions-a' });
    if (needsAgentB) sendEvent('agent-complete', { agent: 'actions-b' });
    if (needsAgentC) sendEvent('agent-complete', { agent: 'actions-c' });

    const allActions: SmartAction[] = [
      ...(needsAgentA && aResult.status === 'fulfilled' && aResult.value ? aResult.value.actions : []),
      ...(needsAgentB && bResult.status === 'fulfilled' && bResult.value ? bResult.value.actions : []),
      ...(needsAgentC && cResult.status === 'fulfilled' && cResult.value ? cResult.value.actions : []),
    ];
    const actions: ActionResult = { actions: allActions as any };
    
    const finalResult = { 
      ...plan, 
      research, 
      agentReasoning: reasoning, 
      smartActions: actions,
      pipelineMetadata: { 
        agentsRun: [
          'prompt-intelligence',
          'intake',
          'planning+research (parallel)',
          'reasoning',
          ...(needsAgentA ? ['actions-a'] : []),
          ...(needsAgentB ? ['actions-b'] : []),
          ...(needsAgentC ? ['actions-c'] : []),
        ],
        researchGrounded: research.wasGrounded === true, 
        version: '4.0.0',
        deadlineType: intake.deadlineType,
        requiredIntegrations: promptIntel.requiredIntegrations,
        taskSummary: promptIntel.taskSummary,
      } 
    };
    sendEvent('complete', { result: finalResult });
    
  } catch (error: any) {
    console.error("-> [SSE API Status] ERROR in /api/generate-plan-stream:", error);
    const isError503 = error?.status === 503 || error?.status === 429 || error?.toString()?.includes("demand") || error?.message?.includes("demand");
    const userFriendlyMsg = isError503 
      ? "PrepPilot's planning agents are currently experiencing high demand. Please try again in a few moments."
      : "PrepPilot is temporarily busy. Please try again in a moment.";
    sendEvent('error', { message: userFriendlyMsg });
  } finally {
    inFlightRequests.delete(requestKey);
    res.end();
  }
});

// POST endpoint at /api/generate-plan (non-streaming fallback)
router.post("/generate-plan", async (req, res) => {
  console.log(`\n==================================================`);
  console.log(`-> [API Request Received] /api/generate-plan`);
  console.log(`-> [User Prompt length]: ${req.body?.description?.length || 0} characters`);

  try {
    const { description } = req.body;

    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Description must be a valid string." });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        error: "Your deadline description is too short (minimum 10 characters). Please provide more details about your upcoming challenge.",
      });
    }

    // Step 0: Prompt Intelligence
    const promptIntel = await runPromptIntelligenceAgent(description);
    console.log(`-> [Prompt Intelligence] Selected integrations: [${promptIntel.requiredIntegrations.join(', ')}]`);
    
    await sleep(400);
    
    const intake = await runIntakeAgent(promptIntel.enhancedPrompt);
    await sleep(600);
    const [plan, research] = await Promise.all([
      runPlanningAgent(intake),
      runResearchAgent(intake)
    ]);
    await sleep(600);
    const reasoning = await runReasoningAgent(intake, plan, research);
    await sleep(600);

    const { needsAgentA, needsAgentB, needsAgentC } = selectActionAgents(promptIntel.requiredIntegrations);

    const agentAPromise = needsAgentA ? runActionAgentA(intake, plan) : Promise.resolve(null);
    if (needsAgentA) await sleep(200);
    const agentBPromise = needsAgentB ? runActionAgentB(intake, plan) : Promise.resolve(null);
    if (needsAgentB) await sleep(200);
    const agentCPromise = needsAgentC ? runActionAgentC(intake, plan) : Promise.resolve(null);

    const [aResult, bResult, cResult] = await Promise.allSettled([
      agentAPromise,
      agentBPromise,
      agentCPromise,
    ]);

    const allActions: SmartAction[] = [
      ...(needsAgentA && aResult.status === 'fulfilled' && aResult.value ? aResult.value.actions : []),
      ...(needsAgentB && bResult.status === 'fulfilled' && bResult.value ? bResult.value.actions : []),
      ...(needsAgentC && cResult.status === 'fulfilled' && cResult.value ? cResult.value.actions : []),
    ];
    const actions: ActionResult = { actions: allActions as any };

    const finalResult = {
      ...plan,
      research,
      agentReasoning: reasoning,
      smartActions: actions,
      pipelineMetadata: {
        agentsRun: [
          'prompt-intelligence',
          'intake',
          'planning+research (parallel)',
          'reasoning',
          ...(needsAgentA ? ['actions-a'] : []),
          ...(needsAgentB ? ['actions-b'] : []),
          ...(needsAgentC ? ['actions-c'] : []),
        ],
        researchGrounded: research.wasGrounded === true,
        version: '4.0.0',
        deadlineType: intake.deadlineType,
        requiredIntegrations: promptIntel.requiredIntegrations,
        taskSummary: promptIntel.taskSummary,
      }
    };
    
    console.log("-> [API Status] SUCCESS: Plan finished and dispatched back to user.");
    return res.status(200).json(finalResult);
  } catch (error: any) {
    console.error("-> [API Status] ERROR during generate-plan execution:", error);
    const isError503 = error?.status === 503 || error?.status === 429 || error?.toString()?.includes("demand") || error?.message?.includes("demand");
    const userFriendlyMsg = isError503 
      ? "PrepPilot is temporarily busy. Please try again in a moment."
      : "PrepPilot's planning agents are currently experiencing high demand. Please try again in a few moments.";

    const statusToReturn = isError503 ? 503 : 500;
    return res.status(statusToReturn).json({ error: userFriendlyMsg });
  }
});

export default router;
