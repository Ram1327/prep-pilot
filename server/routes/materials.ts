import { Router } from "express";
import { runContentAgent } from "../agents/content";

const router = Router();

// POST endpoint for Reference Materials Per Topic
router.post('/topic-materials', async (req, res) => {
  const { topic, context, importance } = req.body;
  
  if (!topic) return res.status(400).json({ error: 'Topic required' });

  try {
    const parsed = await runContentAgent(topic, context, importance);
    res.json(parsed);
  } catch (error: any) {
    console.error("-> [API Topic Materials] ERROR during execution:", error);
    res.status(500).json({ error: error.message || 'Generate materials failed' });
  }
});

export default router;
