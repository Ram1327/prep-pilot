import { Router } from "express";
import { runMonitorAgent } from "../agents/monitor";

const router = Router();

// POST endpoint for Adaptive Replanning
router.post('/replan', async (req, res) => {
  const { originalContext, daysAvailable, urgencyLevel, missedTopics, remainingPlan, keyTopics } = req.body;
  
  if (!originalContext || daysAvailable < 1) {
    return res.status(400).json({ error: 'Invalid replan request' });
  }

  try {
    const parsed = await runMonitorAgent(
      originalContext,
      daysAvailable,
      urgencyLevel,
      missedTopics,
      remainingPlan,
      keyTopics
    );
    res.json(parsed);
  } catch (error: any) {
    console.error("-> [API Replan] ERROR during execution:", error);
    res.status(500).json({ error: error.message || 'Replan failed' });
  }
});

export default router;
