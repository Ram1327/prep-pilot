
# PrepPilot — AI-Powered Execution Engine

**Hackathon Submission Document**
Vibe2Ship 2026 · Built with Google AI Studio & Gemini API

---

## 1. Project Title

**PrepPilot — AI-Powered Execution Engine**

*Plan anything. Prepare for everything.*

---

## 2. Problem Statement Selected

**AI-Powered Productivity & Intelligent Task Execution**

How can AI transform the way individuals prepare for high-stakes events — interviews, exams, presentations, and critical deadlines — by moving beyond simple reminders to generating fully structured, day-by-day preparation strategies integrated directly with their existing tools?

---

## 3. Solution Overview

PrepPilot is a full-stack AI application that converts a plain-English description of any upcoming deadline into a complete, structured execution plan — backed by a multi-agent Gemini AI pipeline and deployed on Google Cloud Run.

When a user describes a goal such as "coding interview at Google in 4 days," PrepPilot orchestrates a cascade of seven specialized AI agents that classify the task, analyze the context, build a day-by-day action plan, surface relevant research, generate strategic reasoning, and produce ready-to-use Google Workspace actions — all streamed to the user in real time via Server-Sent Events (SSE).

---

## 4. Problem Being Solved

Preparing for high-stakes events is cognitively demanding. Most people know what they need to accomplish but struggle to structure their time, prioritize topics, and translate intentions into concrete, daily actions.

Existing tools — to-do apps, calendar reminders, and note-taking platforms — require the user to already know *what* to do and *in what order*. They provide no intelligence, no structure, and no adaptation.

PrepPilot solves this by acting as an on-demand AI strategist: it reasons about the user's deadline, reverse-engineers a realistic preparation roadmap, and surfaces exactly the right actions for each day — removing the planning burden entirely.

---

## 5. Key Features

**Intelligent Task Classification**
A dedicated Prompt Intelligence Agent automatically determines whether a user's input is a simple reminder (e.g., "water my plants," "dentist appointment tomorrow") or a high-stakes preparation task (e.g., "board presentation in 3 days"). Simple tasks receive a lightweight calendar response; preparation tasks trigger the full multi-agent pipeline.

**Multi-Agent AI Planning Pipeline**
Seven sequential and parallel AI agents — each with a distinct role and structured response schema — collaborate to produce a complete preparation strategy, including goal framing, daily plans with themes and checkpoints, key topic prioritization (Critical / High / Medium), milestone targets, and a categorized success checklist.

**Real-Time Streaming Progress**
The planning pipeline streams agent-by-agent progress to the client via Server-Sent Events. Users see each agent activate, work, and complete in real time — creating transparency into the AI reasoning process.

**Selective Google Workspace Action Generation**
The pipeline generates pre-filled Google Workspace actions tailored to the task type:
- Gmail: Draft outreach emails to mentors, recruiters, or accountability partners
- Google Meet: Schedule mock interview or review sessions
- Google Calendar: Block focused study windows with ISO 8601-formatted time slots
- Google Docs: Generate reference cheat-sheet outlines
- Google Slides: Build strategic overview presentations (for pitch/demo tasks)

Only the integrations genuinely relevant to the specific task are activated — not all five by default.

**Execution Dashboard with Trend Analytics**
An authenticated dashboard tracks task completion across all active strategies, calculates completion rates, identifies missed days, and displays a 7-day stacked bar chart showing completed vs. missed tasks per local calendar day. Hour-level countdown timers show exact time remaining on each active strategy's deadline.

**Adaptive Replanning**
Users can request a revised plan mid-execution if their timeline changes, triggering a replan via a dedicated Express route that feeds updated context back into the AI pipeline.

**Error Resilience with Model Cascade**
The Gemini client implements a three-tier model cascade: gemini-3.1-flash-lite (primary), gemini-2.5-flash (fallback), and gemini-2.5-pro (final fallback). Quota errors trigger immediate model switching; overload errors trigger a retry with a 2-second delay — ensuring reliability under high demand.

**Rate Limiting and Security**
The server enforces two-tier Express rate limiting: 5 requests per minute per IP on heavy AI endpoints (plan generation, replan) and 20 requests per minute on lighter endpoints (actions, materials). All Firebase credentials are injected at Vite build time and are never exposed in the runtime container.

---

## 6. Agentic AI Workflow

PrepPilot's backend is a purpose-built multi-agent pipeline. Every agent is a structured Gemini API call with a strict JSON response schema enforced via the `responseSchema` parameter, ensuring well-typed, parseable outputs at every stage.

**Stage 0 — Prompt Intelligence Agent**
Receives the user's raw plain-English input. Classifies the task as `simple_todo` or `prep_task` using rule-based LLM prompting. For simple todos, it emits a lightweight calendar event and exits immediately. For prep tasks, it enriches the prompt with contextual structure and selects only the genuinely relevant Google Workspace integrations from the set: gmail, meet, calendar, docs, slides.

**Stage 1 — Intake Agent**
Parses the enriched prompt to extract structured metadata: deadline type (e.g., job interview, academic exam, product launch), days available, urgency level, and specific contextual details. This structured output becomes the shared context for all downstream agents.

**Stage 2 — Planning Agent and Research Agent (run in parallel)**
The Planning Agent constructs the full execution roadmap: goal summary, time intensity level (Light / Moderate / Intensive / Critical), a day-by-day plan with themes, focus areas, specific tasks, estimated hours, and checkpoint definitions, key topics with importance ratings, milestone targets, and a categorized success checklist.

Simultaneously, the Research Agent surfaces domain-relevant resources, practice materials, and reference frameworks specific to the deadline type.

**Stage 3 — Reasoning Agent**
Synthesizes the intake, plan, and research outputs to generate strategic coaching insights and high-level recommendations that the user should keep in mind throughout their preparation.

**Stage 4 — Action Sub-Agents (selective, run in parallel)**
Based on the integrations selected in Stage 0, only the relevant sub-agents are activated:
- Action Sub-Agent A (Communication): Generates pre-filled Gmail draft and Google Meet session
- Action Sub-Agent B (Planning): Generates Calendar time block and Google Docs cheat-sheet outline
- Action Sub-Agent C (Presentation): Generates a 3-slide Google Slides overview

All outputs are merged and streamed to the client as a single `complete` SSE event.

---

## 7. Technologies Used

**Frontend**
- React 18 with TypeScript (Vite build toolchain)
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- React Router v7 (client-side SPA routing)
- Lucide React (icon library)

**Backend**
- Node.js with Express (TypeScript)
- Server-Sent Events (SSE) for real-time streaming
- esbuild (server bundle compilation)
- express-rate-limit (API protection)

**AI**
- Google Gemini API (@google/genai SDK)
- Structured JSON response schemas (responseSchema parameter)
- Three-tier model cascade: gemini-3.1-flash-lite → gemini-2.5-flash → gemini-2.5-pro

**Authentication and Database**
- Firebase Authentication (Google Sign-In via OAuth 2.0)
- Firebase Firestore (strategy and task persistence)

**Infrastructure**
- Docker (multi-stage production build)
- Google Cloud Run (serverless container hosting)
- Google Artifact Registry (container image storage)
- Google Cloud Build (CI/CD pipeline)

---

## 8. Google Technologies Utilized

| Google Technology | How It Is Used |
|---|---|
| Gemini API (gemini-3.1-flash-lite) | Primary model for all 7 AI agents |
| Gemini API (gemini-2.5-flash) | Automatic fallback when primary quota is exhausted |
| Gemini API (gemini-2.5-pro) | Final fallback for complex reasoning under load |
| Google AI Studio | Application scaffolding, Gemini API key management |
| Firebase Authentication | Google Sign-In OAuth 2.0 user authentication |
| Firebase Firestore | Persistent storage of strategies, tasks, and completion state |
| Google Cloud Run | Serverless container hosting (PORT env, 0.0.0.0 binding) |
| Google Artifact Registry | Docker image registry (asia-south1 region) |
| Google Cloud Build | Remote multi-stage Docker build and push pipeline |
| Google Workspace (Gmail) | Pre-filled outreach email actions |
| Google Workspace (Calendar) | Focused study block scheduling actions |
| Google Workspace (Meet) | Mock interview and review session scheduling |
| Google Workspace (Docs) | Reference cheat-sheet content generation |
| Google Workspace (Slides) | Strategic presentation outline generation |

---

## 9. System Architecture

The application follows a full-stack monorepo architecture with a unified Express server that serves both the API and the compiled React SPA in production.

Client requests arrive over HTTPS at the Cloud Run endpoint. The Express server applies rate limiting middleware before routing to the appropriate API handler. The primary planning endpoint streams agent progress events back to the client via SSE while sequentially calling the Gemini API through the resilient multi-model client. Firebase Auth and Firestore handle all user identity and data persistence independently of the AI pipeline.

In production, Docker's multi-stage build compiles the React SPA with Vite and the server with esbuild, then copies only the compiled dist/ directory into a lean Alpine Node runner image — separating build-time credentials from the runtime environment.

---

## 10. Technical Implementation Highlights

**Structured Schema-Enforced AI Outputs**
Every Gemini API call uses the `responseSchema` parameter with typed field definitions. This eliminates JSON parsing failures and ensures every agent's output conforms to the TypeScript interfaces consumed by the frontend — making the pipeline deterministic and testable.

**Server-Sent Events Streaming Architecture**
The primary planning endpoint (`GET /api/generate-plan-stream`) uses SSE to push agent-level progress events (`agent-start`, `agent-complete`, `simple_task`, `complete`, `error`) to the client. The frontend renders each event as it arrives, providing a live view of the AI pipeline's execution without polling.

**Simple Todo Fast-Path Exit**
When the Prompt Intelligence Agent classifies a task as `simple_todo`, the server emits a `simple_task` SSE event and exits the pipeline immediately — bypassing all five downstream agents. This delivers a lightweight calendar response in under one second and prevents wasted computation on reminders and chores.

**Selective Action Agent Activation**
The `selectActionAgents()` function evaluates the integration set returned by the Prompt Intelligence Agent and activates only the relevant sub-agents. A solo exam study plan activates only Action Sub-Agent B (Calendar + Docs); a job interview activates all three. This reflects real-world judgment and reduces unnecessary API calls.

**In-Flight Request Deduplication**
The server maintains an `inFlightRequests` Map keyed by the first 100 characters of the user's description. Duplicate submissions while a plan is generating receive an immediate SSE error response, preventing redundant concurrent API calls to Gemini.

**Timezone-Safe Dashboard Analytics**
All completion tracking uses local date string formatting (`toLocaleDateString`) rather than UTC-based `toISOString()` calls, eliminating the off-by-one-day bug that occurs when users in UTC+ timezones complete tasks in the evening hours.

**Multi-Stage Docker Production Build**
The Dockerfile uses a two-stage build: the build stage installs all dependencies and compiles both the Vite client bundle and the esbuild server bundle; the runner stage copies only `dist/` with production-only dependencies, keeping the final image lean and credentials out of the runtime container.

---

## 11. User Journey

1. The user lands on the PrepPilot home page and signs in with their Google account via Firebase Authentication.

2. They type a plain-English description of their upcoming challenge — for example: "I have a system design interview at a major tech company in 4 days."

3. The application streams real-time progress as each AI agent activates: task classification, intake analysis, strategy and research building (in parallel), reasoning synthesis, and workspace action generation.

4. The user receives a complete preparation package: a mission statement, a day-by-day execution plan with daily themes and specific tasks, a prioritized topic list with importance ratings, milestone checkpoints, a categorized success checklist, and pre-filled Google Workspace actions ready to open in Gmail, Calendar, Meet, Docs, or Slides.

5. The user marks tasks complete each day. The dashboard tracks execution across all active strategies, calculates completion rates and consecutive-day streaks, shows an exact hour-level countdown to each deadline, and visualizes the last 7 days in a stacked bar chart.

6. If the timeline changes, the user triggers a replan, which feeds updated context back into the AI pipeline and regenerates the strategy without losing prior progress data.

---

## 12. Innovation and Differentiators

**Task Intelligence Before Planning**
Unlike generic AI assistants that treat every input identically, PrepPilot first classifies intent. A reminder about watering plants never reaches the planning pipeline — it receives a calendar response and exits in milliseconds. This classification layer makes the application dramatically more efficient and contextually appropriate.

**Structured AI Outputs as First-Class Citizens**
All Gemini calls use structured response schemas rather than freeform text. This makes the AI pipeline deterministic, testable, and reliable — agent outputs are strongly typed objects, not prose that requires fragile parsing.

**Selective Workspace Integration**
The application does not blindly generate all five Google Workspace actions for every task. The Prompt Intelligence Agent reasons about which integrations are genuinely useful and activates only the relevant sub-agents — reflecting real-world judgment rather than feature padding.

**Production-Grade Reliability Engineering**
The three-tier Gemini model cascade, per-IP rate limiting, in-flight deduplication, graceful SSE error handling, and a React error boundary combine to make PrepPilot production-ready — not a demo prototype.

**End-to-End Google Ecosystem**
From sign-in (Firebase Auth) to data persistence (Firestore), AI reasoning (Gemini API), workspace output (Gmail, Calendar, Meet, Docs, Slides), and hosting (Cloud Run, Artifact Registry, Cloud Build), PrepPilot runs entirely within the Google stack.

---

## 13. Future Scope

**OAuth-Connected Workspace Execution**
Currently, Workspace actions generate pre-filled content that the user opens manually. The natural next step is requesting OAuth scopes to write directly to Google Calendar, create Docs, and send Gmail drafts on behalf of the user — completing the loop from plan to execution.

**Adaptive Plan Monitoring**
An automated monitoring agent could evaluate daily completion data and proactively suggest plan adjustments when the user's velocity falls below the required pace — without requiring manual replan requests.

**Multi-User Collaboration**
Supporting shared strategies would enable study groups, interview prep partners, or team presentation rehearsal coordination, where multiple users share a plan and track collective progress.

**Mobile Application**
A Progressive Web App (PWA) client would allow users to check off tasks, receive push reminders, and view their daily plan from any device.

**Domain-Specific Coaching Models**
System-instructed Gemini models optimized for specific deadline categories — software engineering interviews, academic exams, investor pitches — could generate substantially more targeted and actionable plans.

---

## 14. GitHub Repository

https://github.com/Ram1327/prep-pilot

---

## 15. Deployed Application Link

https://prep-pilot-145034154321.asia-south1.run.app

---

## 16. Team Details

[Team Name — Placeholder]
[Team Member Names — Placeholder]
[Contact Email — Placeholder]

---

*PrepPilot v4.0.0 · Built with Google AI Studio, Gemini API, Firebase, and Google Cloud Run · Vibe2Ship 2026*
