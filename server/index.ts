import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3005;

// Middleware for parsing JSON requests
app.use(express.json());

// ── Rate Limiters ─────────────────────────────────────────────────────────────
// Heavy AI endpoints: plan generation (SSE + POST), replan
const aiHeavyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5,              // 5 AI generation calls per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment and try again." },
});

// Lighter AI endpoints: actions, materials, regenerate
const aiLightLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20,             // 20 lighter calls per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment and try again." },
});

// Import routes
import planRouter from "./routes/plan";
import replanRouter from "./routes/replan";
import actionsRouter from "./routes/actions";
import materialsRouter from "./routes/materials";

// Mount routes with rate limiters applied
app.use("/api/generate-plan-stream", aiHeavyLimiter);
app.use("/api/generate-plan", aiHeavyLimiter);
app.use("/api/replan", aiHeavyLimiter);
app.use("/api/generate-actions", aiLightLimiter);
app.use("/api/regenerate-action", aiLightLimiter);
app.use("/api/topic-materials", aiLightLimiter);

app.use("/api", planRouter);
app.use("/api", replanRouter);
app.use("/api", actionsRouter);
app.use("/api", materialsRouter);

// Vite & Static Asset Handling based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
