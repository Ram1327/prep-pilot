import { Router } from "express";
import { runActionAgentsParallel } from "../agents/action";
import {
  runEmailAgent,
  runCalendarAgent,
  runDocsAgent,
  runSlidesAgent,
  runMeetAgent
} from "../agents/integrationAgents";

const router = Router();

// POST endpoint to generate actions on-demand
router.post('/generate-actions', async (req, res) => {
  const { intake, plan } = req.body;
  
  if (!plan) {
    return res.status(400).json({ error: 'Plan is required' });
  }
  
  // Reconstruct intake if not provided
  const resolvedIntake = intake || {
    deadlineType: plan.pipelineMetadata?.deadlineType || 'other',
    specificContext: plan.goalSummary || '',
    daysAvailable: plan.dailyPlan?.length || 4,
    urgencyLevel: plan.timeAvailable?.intensity?.toLowerCase() || 'medium',
    searchQueries: []
  };

  try {
    const actions = await runActionAgentsParallel(resolvedIntake, plan);
    res.json(actions);
  } catch (error: any) {
    console.error("-> [API Generate Actions] ERROR during execution:", error);
    res.status(500).json({ error: error.message || 'Failed to generate actions' });
  }
});

// POST endpoint to regenerate a single integration action on-demand
router.post('/regenerate-action', async (req, res) => {
  const { type, customPrompt, context, planTheme, keyTopics, daysAvailable } = req.body;

  if (!type || !customPrompt || !context || !planTheme) {
    return res.status(400).json({ error: 'type, customPrompt, context, and planTheme are required' });
  }

  try {
    let result: any = null;
    switch (type) {
      case 'gmail':
        result = await runEmailAgent(context, planTheme, customPrompt);
        break;
      case 'calendar':
        result = await runCalendarAgent(context, daysAvailable || 7, customPrompt);
        break;
      case 'docs':
        result = await runDocsAgent(context, keyTopics || '', customPrompt);
        break;
      case 'slides':
        result = await runSlidesAgent(context, keyTopics || '', customPrompt);
        break;
      case 'meet':
        result = await runMeetAgent(context, customPrompt);
        break;
      default:
        return res.status(400).json({ error: `Unsupported action type: ${type}` });
    }
    res.json(result);
  } catch (error: any) {
    console.error(`-> [API Regenerate Action] ERROR for type ${type}:`, error);
    res.status(500).json({ error: error.message || 'Failed to regenerate action prefill' });
  }
});

export default router;

