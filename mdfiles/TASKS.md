# TASKS.md — PrepPilot

> Last updated: 2026-06-27

---

## Completed

### Core Pipeline
- [x] Implement Intake Agent with structured JSON schema output
- [x] Implement Planning Agent with day-by-day schedule generation
- [x] Implement Research Agent with resource synthesis and key facts
- [x] Implement Reasoning Agent with strategy explanation and risk analysis
- [x] Implement Action Agent with 5 Google Workspace integrations
- [x] Build orchestrator pipeline with parallel Planning + Research execution
- [x] Add SSE streaming endpoint (`/api/generate-plan-stream`) with real-time agent progress
- [x] Implement resilient model cascade: `gemini-3.1-flash-lite` → `gemini-2.5-pro` → `gemini-2.5-flash`
- [x] Add retry logic with quota detection (429) and overload detection (503)
- [x] Add in-flight request deduplication via fingerprinting
- [x] Add 600ms inter-agent sleep for RPM compliance

### Plan Display Components
- [x] Build MissionBrief component (goal summary card)
- [x] Build TimeAnalysis component (countdown, intensity badge, urgency message)
- [x] Build DailyBattlePlan container with expandable DayCard components
- [x] Build DayCard with expand/collapse, complete/missed buttons, adapted state
- [x] Build KeyTopics container with TopicCard components
- [x] Build TopicCard with on-demand material generation (summary, practice Q&A, cheat sheet)
- [x] Build ResearchIntelligence component (2-column layout with clickable resources)
- [x] Build Milestones timeline visualization
- [x] Build SuccessChecklist with categorized checkboxes and 100% auto-collapse
- [x] Build AgentReasoning trace display with status chips and version badge
- [x] Build SmartActions panel with preview modals and one-click execution

### Google Workspace Integrations
- [x] Implement Gmail draft creation (RFC 2822 format, base64 encoding)
- [x] Implement Google Calendar event creation with timezone support
- [x] Implement Google Meet scheduling via Calendar conference data
- [x] Implement Google Docs creation with content insertion
- [x] Implement Google Slides creation with structured slide content
- [x] Build preview modal with type-specific content rendering
- [x] Add "Generate Workspace Integrations" on-demand button for existing plans
- [x] Add OAuth token handling and session expiry detection

### Authentication & Persistence
- [x] Implement Firebase Auth (email/password + Google OAuth)
- [x] Request Google Workspace OAuth scopes (gmail, calendar, docs, slides)
- [x] Implement Firestore task CRUD with `onSnapshot` real-time sync
- [x] Implement localStorage fallback for guest users
- [x] Build local-first optimistic update pattern with background Firestore sync
- [x] Implement Last-Write-Wins timestamp conflict resolution
- [x] Add automatic localStorage → Firestore migration on first login
- [x] Build user profile creation and sync on sign-up/sign-in

### Adaptive Replanning
- [x] Implement `/api/replan` endpoint with Monitor Agent
- [x] Add "Missed" day marking that triggers plan compression
- [x] Display adapted days with ⚡ badge and adaptation notes
- [x] Merge revised days into existing plan

### Layout & Navigation
- [x] Build fixed header with navigation links
- [x] Build fixed sidebar with task list, new task button, settings modal
- [x] Implement responsive mobile sidebar with slide-in animation
- [x] Fix header/sidebar gap issue (0px spacing)
- [x] Add sidebar spacer for desktop content offset

### Dashboard
- [x] Build stats cards (active plans, completion rate, topics studied, streak)
- [x] Build upcoming deadlines widget with urgency sorting
- [x] Build completion trend 7-day bar chart
- [x] Build topic distribution breakdown
- [x] Add click-through navigation to specific plans

### State Persistence Fixes
- [x] Fix checkbox state flickering on page refresh (LWW sync)
- [x] Fix day status (complete/missed) not persisting across sessions
- [x] Fix checklist state not saving to Firestore
- [x] Implement collapsible checklist card at 100% completion

### Additional Features
- [x] Implement plan sharing via URL query parameters
- [x] Build shared plan preview with import option
- [x] Build landing page for unauthenticated users
- [x] Add input validation with shake animation
- [x] Add error cards with retry functionality
- [x] Build toast notification system
- [x] Add settings modal with model configuration display
- [x] Remove legacy "Key Topics" section that duplicated daily plan content
- [x] Silence HMR WebSocket errors in dev console

### Documentation
- [x] Write PROJECT.md with full architecture documentation
- [x] Write CURRENT_STATE.md with implementation details
- [x] Write TASKS.md (this file)
- [x] Write DECISIONS.md with engineering rationale
- [x] Write DESIGN_IMPROVEMENTS.md with UX audit

---

## In Progress

- [x] Product language universalization (student → professional terminology)
- [/] Architecture audit for code quality and separation of concerns
- [/] Hackathon demo preparation and presentation materials

---

## High Priority

### Smart Integrations Overhaul
- [ ] Design per-integration AI agent architecture with specialized system prompts
- [ ] Build floating modal with editable default prompt per integration
- [ ] Implement "Run Integration" → modal → edit prompt → preview → approve → execute flow
- [ ] Create Email Agent with Gmail-specific system prompt
- [ ] Create Calendar Agent with scheduling-specific system prompt
- [ ] Create Docs Agent with document composition system prompt
- [ ] Create Slides Agent with presentation design system prompt
- [ ] Create Meet Agent with meeting scheduling system prompt
- [ ] Add generated content preview step before Workspace API execution
- [ ] Persist integration execution history per task

### Product Repositioning
- [x] Audit all UI copy for student-specific language
- [x] Replace "Preparation Plan" → "Execution Strategy" across components
- [x] Replace "Study Plan" → "Action Plan" in agent prompts
- [x] Replace "study hours" → "focused hours" in TimeAnalysis
- [x] Replace "Study Actions" → "Action Items" in DayCard
- [x] Update HeroSection copy to be profession-agnostic
- [x] Update LandingPage use cases to include professional scenarios
- [x] Update agent system prompts to use universal language

### Code Quality
- [x] Split `server.ts` (914 lines) into modular files:
  - `server/agents/intake.ts`
  - `server/agents/planning.ts`
  - `server/agents/research.ts`
  - `server/agents/reasoning.ts`
  - `server/agents/action.ts`
  - `server/agents/monitor.ts`
  - `server/agents/content.ts`
  - `server/lib/gemini.ts` (resilient call helper)
  - `server/routes/plan.ts`
  - `server/routes/replan.ts`
  - `server/routes/actions.ts`
  - `server/routes/materials.ts`
  - `server/index.ts` (Express setup + startup)
- [x] Extract settings modal from `Sidebar.tsx` into `SettingsModal.tsx`
- [x] Extract preview modal from `SmartActions.tsx` into `ActionPreviewModal.tsx`
- [x] Extract stats calculations from `DashboardPage.tsx` into `useDashboardStats.ts`
- [x] Decompose `HomePage.tsx` into smaller state-specific components
- [x] Create React Context for auth state (replace multiple `useAuth()` calls)
- [x] Remove duplicate type definitions between `server.ts` and `src/types/`
- [x] Fix `package.json` name from `"react-example"` to `"preppilot"`
- [x] Delete stale `grep.exe.stackdump` files
- [x] Add `updatedAt` field to `PrepTask` TypeScript interface
- [x] Replace `prefilled: any` with proper union type in `SmartAction`

---

## Medium Priority

### Testing
- [ ] Add TypeScript strict mode checks
- [ ] Write unit tests for agent pipeline functions
- [ ] Write integration tests for API endpoints
- [ ] Write component tests for critical UI flows
- [ ] Set up CI pipeline with lint + type check + test

### Auth & Security
- [ ] Implement Google OAuth token refresh mechanism
- [ ] Move Firebase config to environment variables
- [ ] Add rate limiting middleware to Express
- [ ] Add request validation middleware (zod or similar)
- [ ] Add CORS configuration for production

### Performance
- [ ] Add task list pagination (Firestore query limits)
- [ ] Implement React.lazy() for page-level code splitting
- [ ] Add React Error Boundaries around major sections
- [ ] Remove excessive console.log statements from production code
- [ ] Optimize Firestore reads with query cursors

### UI Polish
- [ ] Add tasteful glassmorphism to floating modal, navbar, and key cards
- [ ] Add micro-animations for plan section reveals (intersection observer)
- [ ] Add skeleton loading states for plan sections
- [ ] Improve mobile layout for plan cards (especially SmartActions preview modal)
- [ ] Add dark/light theme toggle
- [ ] Add keyboard navigation for accessibility
- [ ] Add proper `aria-label` attributes to interactive elements

### Export & Sharing
- [ ] Implement PDF export of complete plan
- [ ] Implement Markdown export of plan
- [ ] Add social sharing (Twitter/LinkedIn) for completed plans
- [ ] Add team/collaborative plan feature

---

## Future Ideas

### Intelligence Layer
- [ ] Persistent user preference learning across plans
- [ ] Plan comparison tool (compare two strategies)
- [ ] Progress-based difficulty adjustment
- [ ] Integration with external knowledge bases (Google Scholar, arXiv)
- [ ] Voice input for deadline description
- [ ] Multi-language plan generation

### Notification System
- [ ] Email reminders for upcoming plan days
- [ ] Browser push notifications
- [ ] Daily digest emails with progress summary
- [ ] Slack/Discord webhook integrations

### Analytics
- [ ] Historical preparation success tracking
- [ ] Time-to-completion analytics
- [ ] Agent performance metrics (which models were used, latency)
- [ ] User engagement metrics

### Platform
- [ ] Progressive Web App (PWA) with offline support
- [ ] Native mobile app (React Native or Flutter)
- [ ] Chrome Extension for quick plan creation from any page
- [ ] API access for third-party integrations
- [ ] White-label/enterprise offering
- [ ] Admin dashboard for multi-tenant deployment

### Community
- [ ] Public plan templates gallery
- [ ] Community-rated plan strategies
- [ ] Expert-curated preparation frameworks
- [ ] Mentorship matching based on preparation type
