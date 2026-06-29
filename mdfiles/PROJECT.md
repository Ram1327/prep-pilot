# PROJECT.md — PrepPilot

> Last updated: 2026-06-27

---

## Product Vision

PrepPilot is an **AI-powered Deadline Execution Agent** that transforms any high-stakes deadline into a structured, actionable battle plan — complete with day-by-day schedules, research intelligence, strategic reasoning traces, and one-click Google Workspace integrations.

The long-term vision is to become the **universal execution layer between "I have a deadline" and "I'm fully prepared."** PrepPilot is not a study planner. It is an AI orchestration platform that decomposes ambiguity into structured action across any professional domain.

---

## Problem Statement

When people face high-stakes deadlines — interviews, exams, presentations, product launches, certifications — they waste 30–60% of their preparation time on meta-work: figuring out what to study, which resources matter, how to structure their time, and what logistics to handle.

PrepPilot eliminates this meta-work entirely. A single natural-language description of a deadline triggers a coordinated multi-agent AI pipeline that produces a complete execution strategy in under 60 seconds.

---

## Why This Project Exists

1. **Hackathon Origin**: Built for the Vibe2Ship 2026 hackathon to demonstrate deep Google Gemini API integration and Google Workspace automation.
2. **Real Problem**: Deadline anxiety is universal. No existing tool combines AI planning, research synthesis, reasoning transparency, and one-click Google Workspace execution in a single flow.
3. **Technical Showcase**: Demonstrates multi-agent AI orchestration, SSE streaming, structured JSON schema enforcement, resilient model fallback, and real Google API integrations (Gmail, Calendar, Meet, Docs, Slides).

---

## Target Users

PrepPilot is designed as a **universal** tool. While early development used student-centric language, the architecture supports any deadline-driven professional:

| User Type | Example Use Case |
|---|---|
| Students | Exam preparation, thesis defense, certification study |
| Software Engineers | System design interview prep, technical assessment preparation |
| Managers | Quarterly review preparation, board presentation planning |
| Founders | Pitch deck preparation, product launch planning |
| Consultants | Client deliverable planning, proposal preparation |
| Researchers | Conference paper preparation, grant application planning |
| Lawyers | Case preparation, bar exam study |
| Sales Teams | Demo preparation, proposal deadline management |
| Recruiters | Hiring pipeline preparation, interview scheduling |
| Content Creators | Content calendar planning, launch campaign preparation |
| Freelancers | Client deliverable planning, project milestone tracking |
| Marketing Teams | Campaign launch preparation, event planning |
| General Professionals | Any deadline that requires structured preparation |

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 19.0.1 | UI framework (latest with concurrent features) |
| **Routing** | React Router DOM | 7.18.0 | Client-side routing (4 routes) |
| **Styling** | Tailwind CSS | 4.1.14 | Utility-first CSS (v4 with `@tailwindcss/vite`) |
| **Icons** | Lucide React | 0.546.0 | Icon library |
| **Animations** | Motion (Framer) | 12.23.24 | Animation library (available, selectively used) |
| **Bundler** | Vite | 6.2.3 | Dev server and production bundler |
| **Server** | Express | 4.21.2 | API server with SSE streaming |
| **Runtime** | tsx | 4.21.0 | TypeScript execution for dev server |
| **Build** | esbuild | 0.25.0 | Production server bundling |
| **Language** | TypeScript | 5.8.2 | Full-stack type safety |
| **AI** | @google/genai | 2.4.0 | Gemini API client (structured output) |
| **Auth** | Firebase Auth | 12.15.0 | Email/password + Google OAuth |
| **Database** | Cloud Firestore | 12.15.0 | Real-time document persistence |
| **APIs** | Google Workspace | REST v1 | Gmail, Calendar, Docs, Slides, Meet |
| **Environment** | dotenv | 17.2.3 | Environment variable management |

---

## Architecture Overview

### System Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React SPA)                          │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
│  │ Landing  │  │  Login/  │  │Dashboard │  │     HomePage         │ │
│  │  Page    │  │  Signup  │  │  Page    │  │  (Main App Surface)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ │
│                                                    │                 │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    Custom Hooks Layer                          │  │
│  │  useAuth │ usePipeline │ useTasks │ usePlanProgress           │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                           │         │                                │
│              SSE Stream   │    Firestore    Google APIs              │
└──────────────────────────┼─────────┼──────────────────────────────┘
                           │         │
                    ┌──────┴─────────┴──────┐
                    │    Express Server      │
                    │    (server.ts)         │
                    │                        │
                    │  ┌──────────────────┐  │
                    │  │   Orchestrator   │  │
                    │  │   Pipeline       │  │
                    │  └────────┬─────────┘  │
                    │           │             │
                    │  ┌────────┴─────────┐  │
                    │  │  Agent Pipeline  │  │
                    │  │                  │  │
                    │  │  1. Intake       │  │
                    │  │  2. Planning ──┐ │  │
                    │  │  3. Research ──┘ │  │  (parallel)
                    │  │  4. Reasoning   │  │
                    │  │  5. Action      │  │
                    │  └────────┬─────────┘  │
                    │           │             │
                    │  ┌────────┴─────────┐  │
                    │  │  Gemini API      │  │
                    │  │  Resilient Call  │  │
                    │  │                  │  │
                    │  │  Primary:        │  │
                    │  │  gemini-3.1-     │  │
                    │  │  flash-lite      │  │
                    │  │                  │  │
                    │  │  Fallback 1:     │  │
                    │  │  gemini-2.5-pro  │  │
                    │  │                  │  │
                    │  │  Fallback 2:     │  │
                    │  │  gemini-2.5-     │  │
                    │  │  flash           │  │
                    │  └──────────────────┘  │
                    └────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/generate-plan-stream` | SSE streaming pipeline (primary) |
| `POST` | `/api/generate-plan` | Synchronous plan generation (legacy) |
| `POST` | `/api/replan` | Adaptive replanning when a day is missed |
| `POST` | `/api/generate-actions` | On-demand Workspace integration generation |
| `POST` | `/api/topic-materials` | Per-topic study material generation |

### Data Flow

```
User Input → Intake Agent → [Planning Agent ‖ Research Agent] → Reasoning Agent → Action Agent → UI Render
```

Planning and Research run in parallel. Each agent uses Gemini structured JSON output with enforced response schemas.

---

## Current Features

### Core Pipeline
- **5-Agent AI Pipeline**: Intake → Planning + Research (parallel) → Reasoning → Action
- **SSE Streaming**: Real-time agent progress updates during plan generation
- **Resilient Model Cascade**: Automatic fallback across 3 Gemini models (flash-lite → pro → flash)
- **Structured JSON Schemas**: Every agent enforces strict response schemas via `responseMimeType: "application/json"`
- **Duplicate Request Prevention**: In-flight request deduplication via fingerprinting

### Plan Output
- **Mission Brief**: AI-generated motivational goal summary
- **Time Analysis**: Days-to-deadline countdown with intensity classification (Light/Moderate/Intensive/Critical)
- **Daily Battle Plan**: Day-by-day schedule with expandable task logs, checkpoints, and complete/missed tracking
- **Key Topics**: Critical focus areas with importance badges and on-demand material generation (summary, practice questions, cheat sheet)
- **Research Intelligence**: AI-synthesized resources, insider tips, and key facts
- **Milestones**: Timeline visualization with success indicators
- **Success Checklist**: Categorized pre-event checklist (Preparation/Mindset/Logistics/Practice) with 100% auto-collapse
- **Agent Reasoning Trace**: Transparent strategy explanation, risk analysis, and adaptation guidance

### Google Workspace Integrations
- **Gmail**: Create email drafts with pre-filled recipient, subject, and body
- **Google Calendar**: Create study block events with precise timestamps
- **Google Meet**: Schedule meetings with Meet link generation
- **Google Docs**: Create documents with AI-generated content
- **Google Slides**: Create presentations with structured slide decks
- **Preview Modal**: Inspect pre-filled content before execution
- **On-Demand Generation**: Retry/generate integrations for existing plans

### Adaptive Replanning
- **Missed Day Detection**: Mark days as missed to trigger AI-powered plan compression
- **Monitor Agent**: Server-side agent that compresses remaining days and redistributes missed content
- **Visual Adaptation**: Adapted days marked with ⚡ badge and adaptation notes

### Authentication & Persistence
- **Firebase Auth**: Email/password + Google OAuth with Workspace scopes
- **Firestore Sync**: Real-time task persistence with `onSnapshot` subscriptions
- **Local-First**: Optimistic local updates with background Firestore sync
- **Last-Write-Wins**: Timestamp-based conflict resolution between local and server state
- **Guest Mode**: localStorage-only persistence for unauthenticated users
- **Migration**: Automatic localStorage → Firestore migration on first login

### Dashboard
- **Stats Cards**: Active plans, completion rate, topics studied, day streak
- **Upcoming Deadlines**: Sorted by urgency with visual countdown
- **Completion Trend**: 7-day stacked bar chart (completed vs missed)
- **Topic Distribution**: Importance breakdown (Critical/High/Medium)
- **Quick Navigation**: Click-through to specific plans or create new

### UI/UX
- **Premium Dark Theme**: Custom CSS variables, ambient glow effects, grid background
- **Fixed Header + Sidebar**: Persistent navigation with 260px sidebar
- **Responsive Design**: Mobile sidebar with slide-in animation and backdrop overlay
- **Plan Sharing**: URL-based plan sharing via `?shared_plan=` query parameter
- **Loading States**: Real-time pipeline progress visualization with agent status chips

---

## Planned Features

- Per-integration AI agent modals with editable prompts
- Universal language repositioning (student → professional)
- Glassmorphism UI refinements
- Calendar sync for day-by-day schedule
- Notification/reminder system
- Plan export (PDF/markdown)
- Team/collaborative plans
- Mobile-optimized view
- Analytics dashboard with historical trends

---

## Deployment

| Target | Status |
|---|---|
| **Local Dev** | ✅ Fully functional on `http://localhost:3005` |
| **AI Studio** | ✅ Linked app: `ai.studio/apps/3f79a147-3618-4d2b-9b3b-5d5816b13cc9` |
| **Cloud Run** | 🔲 Not yet deployed (production build pipeline ready via `npm run build` + `npm start`) |
| **Firebase** | ✅ Auth + Firestore configured (`preppilot-custom` project) |

### Build Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (tsx server.ts → localhost:3005)
npm run build      # Production build (vite build + esbuild server bundle)
npm start          # Start production server (node dist/server.cjs)
npm run lint       # TypeScript check (tsc --noEmit)
```

### Environment Variables

```
GEMINI_API_KEY=<your-gemini-api-key>
PORT=3005          # Optional, defaults to 3005
```

---

## Agent System Overview

### Agent 1: Intake Agent
- **Input**: Raw user description string
- **Output**: `IntakeResult` — deadline type, context, days available, urgency level, 3 search queries
- **Role**: Parse and classify the user's natural-language input into structured metadata

### Agent 2: Planning Agent
- **Input**: `IntakeResult`
- **Output**: `PlanningResult` — goal summary, time analysis, daily plan array, key topics, milestones, success checklist
- **Role**: Generate a complete day-by-day preparation schedule with checkpoints and topic breakdowns

### Agent 3: Research Agent
- **Input**: `IntakeResult`
- **Output**: `ResearchResult` — top resources, key facts, insider tips
- **Role**: Synthesize expert preparation resources and insights using Gemini's knowledge
- **Note**: Runs in parallel with Planning Agent

### Agent 4: Reasoning Agent
- **Input**: `IntakeResult` + `PlanningResult` + `ResearchResult`
- **Output**: `ReasoningResult` — strategy rationale, key insight, biggest risk, adaptation guidance
- **Role**: Generate metacognitive reasoning that explains why the plan was structured the way it was

### Agent 5: Action Agent
- **Input**: `IntakeResult` + `PlanningResult`
- **Output**: `ActionResult` — 5 smart actions (Gmail, Calendar, Meet, Docs, Slides)
- **Role**: Generate pre-filled Google Workspace integration actions

### Monitor Agent (Replanning)
- **Trigger**: User marks a day as "missed"
- **Input**: Original context, remaining plan, missed topics, key topics
- **Output**: `ReplanResponse` — revised days with adaptation notes
- **Role**: Compress remaining schedule and redistribute critical missed content

### Content Agent (Topic Materials)
- **Trigger**: User clicks "Generate Materials" on a key topic
- **Input**: Topic name, context, importance
- **Output**: Summary, practice questions (with answers + difficulty), 5-point cheat sheet
- **Role**: Generate on-demand deep-dive study materials for individual topics

---

## Google Ecosystem Usage

| Service | Integration Type | Implementation |
|---|---|---|
| **Gemini API** | Server-side structured generation | `@google/genai` with JSON schemas |
| **Firebase Auth** | Email/password + Google OAuth | `firebase/auth` with Workspace scopes |
| **Cloud Firestore** | Real-time document persistence | `firebase/firestore` with `onSnapshot` |
| **Gmail API** | Draft creation (RFC 2822) | `googleapis.com/gmail/v1` REST |
| **Google Calendar API** | Event creation with timezone | `googleapis.com/calendar/v3` REST |
| **Google Meet** | Meeting scheduling via Calendar | Conference data with `hangoutsMeet` |
| **Google Docs API** | Document creation + content insert | `docs.googleapis.com/v1` REST |
| **Google Slides API** | Presentation creation + slides | `slides.googleapis.com/v1` REST |

### OAuth Scopes Requested
```
gmail.compose
calendar
calendar.events
documents
presentations
```

---

## Folder Structure

```
prepilot/
├── server.ts                    # Express server + 5 AI agents + all API routes (914 lines)
├── package.json                 # Dependencies and scripts
├── vite.config.ts               # Vite + Tailwind v4 + React plugin
├── tsconfig.json                # TypeScript configuration (ES2022, bundler resolution)
├── index.html                   # SPA entry point
├── firestore.rules              # Firestore security rules (user-partitioned)
├── firebase-blueprint.json      # Firestore schema definition
├── firebase-applet-config.json  # AI Studio applet configuration
├── metadata.json                # App metadata (name, description, capabilities)
├── .env                         # Environment variables (GEMINI_API_KEY)
├── .env.example                 # Template for environment setup
│
├── mdfiles/                     # Project documentation
│   ├── Read-only/               # Immutable operating procedures
│   │   ├── instructions.md      # Agent operating procedures
│   │   ├── soul.md              # Role definition and philosophy
│   │   └── workflow.md          # Development loop specification
│   ├── PROJECT.md               # ← This file
│   ├── CURRENT_STATE.md         # Current implementation state
│   ├── TASKS.md                 # Task tracking
│   ├── DECISIONS.md             # Engineering decision log
│   └── DESIGN_IMPROVEMENTS.md   # UX audit and improvement plan
│
├── src/
│   ├── main.tsx                 # React entry point + WebSocket error silencing
│   ├── App.tsx                  # Router, auth wrapper, layout shell (122 lines)
│   ├── index.css                # Design system tokens + Tailwind imports (165 lines)
│   │
│   ├── pages/
│   │   ├── HomePage.tsx         # Main app surface: input → pipeline → plan display (447 lines)
│   │   ├── DashboardPage.tsx    # Analytics dashboard: stats, deadlines, trends (607 lines)
│   │   ├── LoginPage.tsx        # Email/password + Google OAuth login (195 lines)
│   │   └── SignupPage.tsx       # Registration with validation (230 lines)
│   │
│   ├── components/
│   │   ├── InputForm.tsx        # Deadline description textarea with submit
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Fixed top navigation bar (103 lines)
│   │   │   ├── Footer.tsx       # Bottom links and version (29 lines)
│   │   │   ├── Sidebar.tsx      # Left sidebar with task list + settings modal (440 lines)
│   │   │   ├── HeroSection.tsx  # Hero headline for new plan creation (39 lines)
│   │   │   └── LandingPage.tsx  # Public landing page for unauthenticated users (315 lines)
│   │   ├── plan/
│   │   │   ├── MissionBrief.tsx         # Goal summary card (29 lines)
│   │   │   ├── TimeAnalysis.tsx         # Deadline countdown + intensity (78 lines)
│   │   │   ├── DailyBattlePlan.tsx      # Day schedule container (72 lines)
│   │   │   ├── DayCard.tsx              # Individual day with expand/complete/miss (181 lines)
│   │   │   ├── KeyTopics.tsx            # Topic list container (41 lines)
│   │   │   ├── TopicCard.tsx            # Topic with material generation (200 lines)
│   │   │   ├── ResearchIntelligence.tsx # Research results display (129 lines)
│   │   │   ├── Milestones.tsx           # Timeline milestone visualization (68 lines)
│   │   │   ├── SuccessChecklist.tsx     # Categorized checklist with collapse (152 lines)
│   │   │   ├── SmartActions.tsx         # Workspace integrations panel (564 lines)
│   │   │   └── AgentReasoning.tsx       # AI reasoning trace display (130 lines)
│   │   ├── loading/
│   │   │   ├── LoadingState.tsx         # Pipeline loading wrapper
│   │   │   └── PipelineProgress.tsx     # Agent progress visualization
│   │   └── ui/
│   │       ├── Card.tsx                 # Reusable card wrapper
│   │       ├── Badge.tsx                # Variant badge component
│   │       └── Toast.tsx                # Notification toast
│   │
│   ├── hooks/
│   │   ├── useAuth.ts           # Firebase auth state + Google OAuth (131 lines)
│   │   ├── usePipeline.ts       # SSE pipeline state management (154 lines)
│   │   ├── usePlanProgress.ts   # Day status tracking + replanning (171 lines)
│   │   └── useTasks.ts          # Firestore CRUD + local-first sync (330 lines)
│   │
│   ├── lib/
│   │   ├── firebase.ts          # Firebase initialization + OAuth scopes (27 lines)
│   │   ├── googleApi.ts         # Google Workspace API helpers (277 lines)
│   │   ├── api.ts               # API client interfaces + helpers (54 lines)
│   │   └── storage.ts           # localStorage utilities (51 lines)
│   │
│   └── types/
│       ├── plan.ts              # Plan, Task, Action type definitions (145 lines)
│       └── agent.ts             # Agent status and pipeline types (58 lines)
│
├── dist/                        # Production build output
├── assets/                      # Static assets
└── node_modules/                # Dependencies
```

---

## Future Roadmap

### Phase 1: Hackathon Polish (Current)
- Complete documentation audit
- Product language universalization
- UI polish and glassmorphism refinements
- Demo recording and presentation preparation

### Phase 2: Integration Intelligence
- Per-integration AI agent modals with editable prompts
- Agent-driven content generation (not just pre-filled templates)
- Real-time prompt customization before Workspace execution

### Phase 3: Platform Expansion
- PDF/Markdown export of plans
- Collaborative/team plans with shared workspaces
- Push notification reminders
- Calendar sync for automated day-by-day scheduling
- Historical analytics and preparation patterns

### Phase 4: Enterprise
- Custom agent pipelines per organization
- SSO integration
- Admin dashboard
- API access for third-party integrations
- Multi-language support
