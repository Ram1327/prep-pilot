# CURRENT_STATE.md — PrepPilot

> Last updated: 2026-06-27

---

## Current Progress

**Milestone**: Post-MVP Feature Complete  
**Branch**: Main (single branch development)  
**Version**: v3.0.0 (pipeline v3.0.0)  
**Last Session**: Documentation audit and architecture review  
**Status**: ✅ Functional — all core features operational  

---

## Current UI

### Layout Structure
- **Fixed Header** (64px): PrepPilot logo, navigation links (Home, Dashboard), user avatar, logout button. Full-width, pinned to viewport top with `z-index: 100`.
- **Fixed Sidebar** (260px): Left-anchored below header. Contains "New Preparation" button, scrollable task list with emoji-by-type indicators, user profile card with settings modal. Mobile: slide-in with backdrop overlay.
- **Main Content Area**: Flex layout right of sidebar. Scrolls independently. Max-width 900px for plan views, 4xl for dashboard.
- **Footer**: Version stamp ("Vibe2Ship 2026 • v1.4.2"), navigation links.
- **Ambient Effects**: Two radial gradient glows (indigo, purple) positioned absolutely behind content.

### Design System
- **Typography**: Outfit (sans-serif), JetBrains Mono (monospace)
- **Color Palette**: Deep dark theme (`#07070a` primary, `#12121a` cards) with indigo/purple accent system
- **CSS Variables**: 15+ custom properties for consistent theming
- **Grid Background**: Subtle repeating grid pattern via CSS

---

## Implemented Pages

### 1. Landing Page (`/` — unauthenticated)
- Hero section: "Plan anything. Prepare for everything."
- 6 use case cards: Job Interview, Business Presentation, Academic Exam, Product Launch, Certification, Hackathon
- "How It Works" 4-step flow: Describe → AI Agents → Smart Actions → Act
- Google integrations bar with service SVG icons
- CTA section with Sign Up button
- **Status**: ✅ Complete

### 2. Home Page (`/` — authenticated)
- **State A — New Plan**: Hero section + input form → pipeline loading → plan display
- **State B — Existing Plan**: Full plan card stack (9 sections)
- **State C — Empty**: Fallback with "Create New Preparation" CTA
- **State D — Shared Plan**: Preview banner with "Import to My Preparations" action
- Input validation: minimum 10 characters, shake animation on invalid submit
- **Status**: ✅ Complete

### 3. Dashboard Page (`/dashboard` — protected)
- 4 stats cards: Active Plans, Completion Rate, Topics Studied, Day Streak
- 2×2 bento grid:
  - Upcoming Deadlines (sorted by days remaining)
  - Preparation Progress (per-plan completion bars)
  - Completion Trend (7-day stacked bar chart, CSS-rendered)
  - Topic Distribution (Critical/High/Medium percentage bars)
- Click-through navigation to specific plans
- **Status**: ✅ Complete

### 4. Login Page (`/login`)
- Email/password form with validation
- Google OAuth button (triggers Workspace scope consent)
- Firebase error code mapping to friendly messages
- Link to signup page
- **Status**: ✅ Complete

### 5. Signup Page (`/signup`)
- Name, email, password, confirm password form
- Password validation (min 6 chars, match check)
- Google OAuth button
- Firebase error mapping
- Link to login page
- **Status**: ✅ Complete

---

## Preparation Flow (Plan Generation)

### Input
User types a natural-language deadline description (min 10 chars) and submits.

### Pipeline Execution (SSE Streaming)
1. **Intake Agent** → Classifies deadline type, extracts context, calculates days, sets urgency
2. **Planning Agent** (parallel) → Generates day-by-day schedule, topics, milestones, checklist
3. **Research Agent** (parallel) → Synthesizes expert resources, facts, insider tips
4. **Reasoning Agent** → Generates strategic rationale, risk analysis, adaptation guidance
5. **Action Agent** → Produces 5 Google Workspace integration actions

Real-time progress is streamed to the client via Server-Sent Events. Each agent transitions through `pending → running → complete` with status chips displayed in the loading UI.

### Output (9 Plan Sections)
1. **Mission Brief** — Motivational goal summary paragraph
2. **Time Analysis** — Days countdown, hours/day, intensity badge, urgency message
3. **Daily Battle Plan** — Expandable day cards with tasks, checkpoints, complete/miss buttons
4. **Research Intelligence** — 2-column layout: insider tips + key facts | clickable resources
5. **Smart Actions** — 5 Workspace integrations with preview modals and one-click execution
6. **Milestones** — Vertical timeline with success indicators
7. **Success Checklist** — Categorized checklist that auto-collapses at 100%
8. **Agent Reasoning Trace** — Strategy, insight, risk, adaptation with version/grounding badges

### Post-Generation
- Plan is automatically saved as a PrepTask (local + Firestore)
- Task appears in sidebar for future reference
- Day progress (complete/missed) persists across sessions

---

## History & Task Management

- Tasks persist in Firestore (authenticated) or localStorage (guest)
- Sidebar displays all tasks sorted by creation date (newest first)
- Each task shows: deadline emoji, truncated title (45 chars), relative timestamp
- Delete button appears on hover per task
- Active task is highlighted with accent border
- Task selection loads the full plan view
- Plan sharing via URL: `/?shared_plan=<taskId>&uid=<userId>`
- Shared plans show a preview banner with import option

---

## Agent Reasoning

The Reasoning Agent produces 4 transparent metadata fields:

1. **Strategy Choice & Synergy** — Why this specific preparation strategy was chosen
2. **Key Insight** — The most important insight about this deadline type
3. **Biggest Risk & Mitigation** — Most likely failure mode and how the plan addresses it
4. **Adaptation Plan** — How to adjust if falling behind schedule

Displayed with:
- Agent status chips (Intake, Planning, Research, Reasoning — all "Complete")
- Research grounding badge (when applicable)
- Pipeline version badge (v3.0.0)
- Animated telemetry indicator

---

## Smart Integrations (Workspace Actions)

### Current State
- **Architecture**: Action Agent generates 5 pre-filled actions (one per Google service)
- **Execution Flow**: Click "Run Integration" → Google API call → Success URL returned
- **Preview**: Modal shows pre-filled content before execution (type-specific fields)
- **Auth Requirement**: Google OAuth with Workspace scopes for execution
- **On-Demand Generation**: "Generate Workspace Integrations" button for plans without actions
- **Error Handling**: Session expiry detection, user-friendly error messages

### Supported Integrations

| Service | What It Creates | Pre-filled Fields |
|---|---|---|
| Gmail | Draft email | To, Subject, Body |
| Calendar | Study block event | Title, Start/End time, Description |
| Meet | Meeting with link | Title, Start time, Duration, Attendees |
| Docs | Document | Title, Content body |
| Slides | Presentation | Title, Slide titles + bullet points |

### Limitations
- Actions are static once generated (no prompt editing)
- No per-integration AI agent with custom system prompts
- Google OAuth token expires after ~1 hour (requires re-sign-in)
- No integration execution history persistence
- Content quality depends entirely on Action Agent's single generation pass

---

## Deployment Status

| Component | Status | Details |
|---|---|---|
| **Local Dev Server** | ✅ Running | `http://localhost:3005` via `tsx server.ts` |
| **Vite Dev Server** | ✅ Integrated | Middleware mode inside Express |
| **Firebase Auth** | ✅ Connected | Project: `preppilot-custom` |
| **Cloud Firestore** | ✅ Connected | Database: `ai-studio-3f79a147-...` |
| **Gemini API** | ✅ Operational | Primary: `gemini-3.1-flash-lite` |
| **Google Workspace APIs** | ✅ Functional | Gmail, Calendar, Docs, Slides, Meet |
| **Cloud Run** | 🔲 Not deployed | Build pipeline ready (`npm run build` → `npm start`) |
| **HMR** | ❌ Disabled | `hmr: false, watch: null` in vite.config.ts |

---

## Authentication Status

| Method | Status | Notes |
|---|---|---|
| Email/Password | ✅ Working | Standard Firebase Auth |
| Google OAuth | ✅ Working | With Workspace scopes (gmail, calendar, docs, slides) |
| Token Storage | ✅ Working | Access token in `sessionStorage` |
| Profile Sync | ✅ Working | Firestore user doc creation on first login |
| Logout | ✅ Working | Clears all local/session storage |

---

## Current Backend Architecture

### Server Structure (server.ts — 914 lines)
Everything lives in a single file:
- **Lines 1–29**: Imports, Express setup, Gemini client factory
- **Lines 31–119**: TypeScript interfaces for all agent results
- **Lines 121–180**: `callGeminiResilient()` — model cascade with retry logic
- **Lines 186–224**: Intake Agent definition
- **Lines 226–355**: Planning Agent definition (largest schema)
- **Lines 357–448**: Research Agent definition (custom retry logic)
- **Lines 450–473**: Reasoning Agent definition
- **Lines 475–558**: Action Agent definition
- **Lines 560–596**: Orchestrator pipeline + `sleep()` helper
- **Lines 598–694**: SSE streaming endpoint (`/api/generate-plan-stream`)
- **Lines 696–754**: Replan endpoint (`/api/replan`)
- **Lines 756–780**: Generate actions endpoint (`/api/generate-actions`)
- **Lines 782–831**: Topic materials endpoint (`/api/topic-materials`)
- **Lines 833–888**: Legacy POST plan endpoint (`/api/generate-plan`)
- **Lines 890–914**: Vite middleware + server startup

### Rate Limiting Strategy
- 600ms `sleep()` between sequential agent calls (respects 15 RPM Gemini limit)
- In-flight request deduplication via `Map<string, boolean>`
- 2 retry attempts per model before cascade

---

## Known Limitations

1. **Single-file server**: All 914 lines of backend logic in one `server.ts` — agents, routes, schemas, orchestration
2. **No test suite**: Zero unit, integration, or e2e tests
3. **OAuth token expiry**: Google access token (~1hr lifetime) stored in sessionStorage with no refresh mechanism
4. **Static integrations**: Action Agent generates content once; no user-editable prompts or regeneration per integration
5. **No error boundaries**: React error boundaries not implemented; component errors can crash the app
6. **Hardcoded Firebase config**: API keys embedded in `src/lib/firebase.ts` (acceptable for client-side Firebase but not ideal)
7. **No rate limiting on client**: No client-side throttle on plan generation requests beyond in-flight dedup
8. **Console logging**: Extensive `console.log` statements throughout production code (useAuth, server agents)
9. **Type safety gaps**: `prefilled: any` in SmartAction type; `plan?: any` in SmartActionsProps
10. **No pagination**: Task list loads all tasks at once (Firestore query has no limit)
11. **Mixed styling approaches**: Inline styles, Tailwind classes, and CSS variables all used interchangeably

---

## Current Technical Debt

| Area | Debt | Impact |
|---|---|---|
| `server.ts` | 914-line monolith | Hard to test, review, or maintain individual agents |
| `Sidebar.tsx` | 440 lines with inline settings modal | Should be extracted into separate components |
| `SmartActions.tsx` | 564 lines with preview modal | Modal should be a separate component |
| `DashboardPage.tsx` | 607 lines with all stats logic inline | Stats calculations should be extracted to hooks/utils |
| `HomePage.tsx` | 447 lines managing 3 states + sidebar + sharing | God component; needs decomposition |
| Type definitions | Duplicated interfaces between `server.ts` and `src/types/` | Single source of truth needed |
| Error handling | `catch` blocks log to console but don't surface to user consistently | User may see silent failures |
| `useAuth` hook | Singleton pattern via module-level state creates multiple instances | Should use React Context |
| `grep.exe.stackdump` | Stale crash dump files in `src/` and `src/components/` | Should be gitignored and deleted |
| `package.json` name | Still `"react-example"` | Should be `"preppilot"` |

---

## Current Blockers

1. **No critical blockers** — all core features are functional
2. **Non-blocking issues**:
   - HMR disabled (requires full page refresh during development)
   - Google OAuth token refresh not implemented (affects long sessions)
   - `package.json` name hasn't been updated from template default
