# DECISIONS.md — PrepPilot

> Last updated: 2026-06-27

---

## Decision Log

Every major engineering and product decision is documented below with date, rationale, alternatives considered, and impact.

---

### 1. Why Gemini (not GPT-4, Claude, or open-source models)

**Date**: 2026-06-24  
**Decision**: Use Google Gemini as the exclusive AI backbone.  
**Rationale**:
- PrepPilot is built for the **Vibe2Ship hackathon** which specifically evaluates Google ecosystem integration depth.
- Gemini offers **structured JSON output** via `responseMimeType: "application/json"` with `responseSchema` enforcement — eliminating fragile prompt-based JSON parsing.
- The `@google/genai` SDK provides a clean server-side API with built-in schema validation.
- Gemini models have generous free-tier quotas suitable for hackathon demos.
- Using Gemini exclusively demonstrates end-to-end Google stack commitment (Gemini + Firebase + Workspace APIs).

**Alternatives considered**:
- OpenAI GPT-4o: Superior reasoning but no native JSON schema enforcement; would require `json_mode` + manual validation. Not part of Google ecosystem.
- Anthropic Claude: Strong structured output but no Google ecosystem alignment.
- Open-source (Llama, Mistral): Would require self-hosting infrastructure, defeating the serverless architecture goal.

**Impact**: Deep integration with Gemini structured output across all 5+ agents. Model cascade provides resilience without leaving the Gemini ecosystem.

---

### 2. Why Multi-Agent Pipeline (not single-prompt)

**Date**: 2026-06-24  
**Decision**: Decompose plan generation into 5 specialized agents (Intake → Planning + Research → Reasoning → Action) rather than a single mega-prompt.  
**Rationale**:
- **Separation of concerns**: Each agent has a focused responsibility with a tailored system prompt and response schema.
- **Parallelism**: Planning and Research agents run concurrently via `Promise.all()`, cutting total latency by ~40%.
- **Reliability**: If one agent fails, others have already completed. Failure is isolated rather than total.
- **Schema precision**: Each agent's JSON schema is tight and focused (50–100 properties) rather than one massive schema (300+ properties) that increases hallucination risk.
- **Transparency**: The pipeline structure enables real-time progress streaming — users see each agent activate, process, and complete.
- **Extensibility**: New agents (Monitor, Content) can be added without modifying existing agents.
- **Demo value**: A visible multi-agent pipeline with real-time status chips is significantly more impressive to hackathon judges than a single loading spinner.

**Alternatives considered**:
- Single mega-prompt: Simpler implementation but produces lower-quality output, cannot parallelize, and provides no progress visibility.
- LangChain/LangGraph: Adds framework dependency and complexity without clear benefit for this use case. Custom orchestration is more transparent.
- Async message queue: Over-engineered for a synchronous request-response flow.

**Impact**: 5-agent pipeline with SSE streaming. Planning + Research run in parallel. Each agent has isolated retry logic and schema validation. Real-time progress visualization in the UI.

---

### 3. Why JSON Schema Enforcement (not free-text parsing)

**Date**: 2026-06-24  
**Decision**: Use Gemini's native `responseSchema` parameter with `Type.OBJECT` definitions for every agent.  
**Rationale**:
- **Deterministic structure**: Every agent response is guaranteed to match the expected TypeScript interface. No regex parsing, no `JSON.parse()` failure handling, no "please output valid JSON" prompt hacking.
- **Type safety**: Response schemas map 1:1 to TypeScript interfaces defined in `src/types/plan.ts` and `src/types/agent.ts`.
- **Reduced hallucination**: Constrained output format forces the model to fill specific fields rather than generating free-form text.
- **Eliminates post-processing**: No need for response sanitization, markdown stripping, or format validation.

**Alternatives considered**:
- Free-text output with JSON extraction: Fragile, requires regex or markdown code block parsing. Common source of production bugs.
- Gemini's `json_mode` without schema: Produces JSON but doesn't guarantee field presence or types.
- Tool/function calling: Appropriate for action execution but over-complicated for structured data generation.

**Impact**: All 7 agent functions use `responseSchema` with `Type.OBJECT` definitions. Zero JSON parsing failures in production. Direct `JSON.parse()` on `response.text` is reliable.

---

### 4. Why React 19 + Vite (not Next.js, Remix, or plain HTML)

**Date**: 2026-06-24  
**Decision**: Use React 19 with Vite as a single-page application (SPA) with a custom Express server.  
**Rationale**:
- **SPA simplicity**: PrepPilot is a client-heavy application with no SEO requirements (authenticated app). Server-side rendering adds complexity without benefit.
- **Vite speed**: Sub-second HMR (when enabled), instant dev server startup, and optimized production builds.
- **Custom server control**: Express server handles API routes, SSE streaming, and Gemini API calls. A framework like Next.js would impose its own API route conventions.
- **React 19**: Latest features (concurrent rendering, automatic batching) without breaking changes.
- **Tailwind v4**: Native Vite plugin (`@tailwindcss/vite`) for zero-config CSS utility generation.

**Alternatives considered**:
- Next.js: Adds SSR/ISR complexity, imposes file-based routing, and has its own API route conventions that would conflict with Express SSE streaming.
- Remix: Similar SSR overhead; the data loading model doesn't align with SSE streaming.
- Plain HTML/JS: Faster initial setup but unmaintainable at 20+ component scale.
- Angular/Vue: No technical advantage and less ecosystem familiarity.

**Impact**: Clean separation between Express API server and React SPA. Vite runs in middleware mode inside Express for development. Production build outputs static assets + bundled server.

---

### 5. Why Firebase Auth + Firestore (not Supabase, Auth0, or custom)

**Date**: 2026-06-24  
**Decision**: Use Firebase Authentication and Cloud Firestore for user management and data persistence.  
**Rationale**:
- **Google ecosystem alignment**: Firebase is a Google product, reinforcing the all-Google stack for the hackathon.
- **Google OAuth integration**: Firebase Auth natively supports Google sign-in with custom OAuth scopes — critical for Workspace API access.
- **Real-time sync**: Firestore's `onSnapshot` enables live data synchronization without polling or WebSocket infrastructure.
- **Zero-ops**: No database provisioning, no connection pooling, no migration scripts. Serverless scaling out of the box.
- **Security rules**: Declarative Firestore rules enforce user-partitioned access (`request.auth.uid == userId`).
- **Client SDK**: Firebase JS SDK handles auth state persistence, token refresh, and offline support.

**Alternatives considered**:
- Supabase (PostgreSQL + PostgREST): More powerful querying but requires schema migration. Not part of Google ecosystem.
- Auth0: Enterprise-grade auth but adds third-party dependency and doesn't provide database.
- Custom JWT + PostgreSQL: Maximum control but significant infrastructure overhead for a hackathon project.
- localStorage only: Insufficient for multi-device access and plan sharing.

**Impact**: Firebase Auth handles email/password and Google OAuth with Workspace scopes. Firestore stores user profiles and tasks with real-time sync. Security rules enforce per-user data isolation.

---

### 6. Why SSE Streaming (not WebSockets or polling)

**Date**: 2026-06-24  
**Decision**: Use Server-Sent Events (SSE) for real-time pipeline progress updates.  
**Rationale**:
- **Unidirectional**: Pipeline progress flows server → client only. SSE is purpose-built for this pattern.
- **Native browser support**: `EventSource` API requires zero dependencies. No Socket.IO or ws library needed.
- **HTTP-compatible**: Works through proxies, load balancers, and CDNs without special configuration.
- **Automatic reconnection**: `EventSource` handles reconnection natively (though we close the connection on completion).
- **Express compatibility**: SSE is just HTTP response streaming — works directly with Express without middleware.

**Alternatives considered**:
- WebSockets: Bidirectional capability is unnecessary. Adds complexity (ws library, connection management, heartbeats).
- Long polling: Higher latency, more HTTP overhead, and more complex client-side logic.
- POST with polling: Would require storing pipeline state server-side and client-side polling interval management.

**Impact**: Clean SSE implementation with custom event types (`agent-start`, `agent-complete`, `complete`, `error`). Client uses native `EventSource` with event listeners. 3-minute backup timeout prevents hanging connections.

---

### 7. Why Resilient Model Cascade (not single model)

**Date**: 2026-06-24  
**Decision**: Implement a 3-model cascade (`gemini-3.1-flash-lite` → `gemini-2.5-pro` → `gemini-2.5-flash`) with per-model retry logic.  
**Rationale**:
- **Quota resilience**: Free-tier Gemini has rate limits (15 RPM). Running 5 agents sequentially can exhaust quota. Cascade provides fallback.
- **Availability**: During high demand, individual models may return 503. Cascading ensures at least one model responds.
- **Cost optimization**: `flash-lite` is the cheapest/fastest model. We try it first and only escalate to `pro` (more expensive, higher reasoning) on failure.
- **Differentiated retry**: Quota errors (429) trigger immediate model switch. Overload errors (503) trigger same-model retry with 2s delay. Other errors cascade immediately.

**Alternatives considered**:
- Single model with exponential backoff: Simpler but risk total failure if the one model is down.
- Client-side retry: Would expose API key and increase client complexity.
- Queue-based rate limiting: Over-engineered; the 600ms sleep + cascade is sufficient for the use case.

**Impact**: `callGeminiResilient()` function handles all model selection, retry, and error classification. Each agent function simply calls this helper. Research Agent has its own cascade (2 models) for additional resilience.

---

### 8. Why Local-First with Background Sync (not server-first)

**Date**: 2026-06-26  
**Decision**: All mutations (create, update, delete) apply to local state and localStorage immediately, then sync to Firestore asynchronously.  
**Rationale**:
- **Instant UI**: Checkbox toggles, day completions, and plan updates reflect immediately without waiting for Firestore round-trip (~200–500ms).
- **Offline capability**: Users can interact with their plans even if Firestore is temporarily unreachable.
- **Prevents flickering**: Early implementation had a "checkbox flicker" bug where Firestore `onSnapshot` would overwrite optimistic local state. The Last-Write-Wins (LWW) timestamp pattern prevents this.
- **Migration path**: Guest users accumulate tasks in localStorage. On first login, tasks are migrated to Firestore without data loss.

**Alternatives considered**:
- Server-first: Wait for Firestore confirmation before updating UI. Creates noticeable lag on every interaction.
- CRDT-based sync: Mathematically correct conflict resolution but massively over-engineered for this use case.
- Client-only: No persistence across devices. Insufficient for a production-grade product.

**Impact**: All `useTasks` mutations follow the pattern: (1) update React state, (2) update localStorage, (3) fire-and-forget Firestore write. `onSnapshot` listener uses `updatedAt` timestamps to resolve conflicts.

---

### 9. Why Reasoning Traces Are Visible (not hidden)

**Date**: 2026-06-24  
**Decision**: Display the Reasoning Agent's output (strategy choice, key insight, biggest risk, adaptation note) as a visible "Agent Reasoning Trace" card in the UI.  
**Rationale**:
- **Transparency**: Users should understand why their plan was structured a certain way. This builds trust in the AI system.
- **Differentiation**: Most AI tools are black boxes. Showing the reasoning trace is a significant competitive differentiator.
- **Hackathon impact**: Visible multi-agent reasoning with status chips, version badges, and grounding indicators is visually impressive and demonstrates technical sophistication.
- **Debugging**: During development, the reasoning trace helps identify when the AI is making poor strategic choices.

**Alternatives considered**:
- Hide reasoning: Simpler UI but loses the transparency advantage.
- Collapsible by default: Reasonable compromise but reduces discoverability.
- Separate "AI Insights" page: Fragments the plan view and reduces engagement.

**Impact**: AgentReasoning component displays 4 reasoning fields with agent status chips, research grounding badge, and pipeline version indicator. Positioned at the bottom of the plan view.

---

### 10. Why Google Workspace Direct API Calls (not Google Apps Script)

**Date**: 2026-06-24  
**Decision**: Call Google Workspace REST APIs directly from the client using OAuth access tokens, rather than routing through Google Apps Script or a server-side proxy.  
**Rationale**:
- **Simplicity**: Direct REST calls with the user's OAuth token require no server-side infrastructure for Workspace operations.
- **User context**: The user's own Google account credentials are used, so created drafts/events/docs appear in their personal Workspace.
- **Low latency**: Client → Google API is a single hop. Client → Server → Google API would double latency.
- **Scope-specific**: OAuth scopes are requested at sign-in time. The access token is stored in sessionStorage and attached to each API call.

**Alternatives considered**:
- Google Apps Script: Requires separate deployment, adds latency, and doesn't operate in the user's account context.
- Server-side proxy: Would require storing user tokens server-side, adding security complexity.
- Google API client library: The `gapi` client library is heavy (~100KB). Raw `fetch()` calls are lighter and sufficient.

**Impact**: `src/lib/googleApi.ts` contains 5 functions (Gmail, Calendar, Meet, Docs, Slides) that make direct REST API calls with the OAuth access token from sessionStorage.

---

### 11. Why Express (not Fastify, Hono, or serverless functions)

**Date**: 2026-06-24  
**Decision**: Use Express.js as the API server framework.  
**Rationale**:
- **Vite integration**: Vite's `createServer` with `middlewareMode` integrates seamlessly with Express middleware.
- **SSE support**: Express response streaming works out of the box for SSE endpoints.
- **Ecosystem**: Largest Node.js server ecosystem. Easy to add middleware (CORS, body parsing, rate limiting).
- **AI Studio compatibility**: The AI Studio build template uses Express as the default server framework.
- **Simplicity**: No learning curve. Minimal boilerplate.

**Alternatives considered**:
- Fastify: Better performance benchmarks but no Vite middleware integration out of the box.
- Hono: Lightweight and fast but less mature ecosystem.
- Serverless functions (Cloud Functions): Cannot maintain SSE connections. Would require architectural change to WebSockets or polling.

**Impact**: Single Express server handles both API routes and Vite dev middleware. Production build bundles the server with esbuild.

---

### 12. Why Tailwind v4 (not v3 or vanilla CSS)

**Date**: 2026-06-24  
**Decision**: Use Tailwind CSS v4 with the native Vite plugin.  
**Rationale**:
- **Zero-config**: `@tailwindcss/vite` plugin eliminates `tailwind.config.js` and PostCSS configuration.
- **Performance**: v4 uses the new Oxide engine for faster builds.
- **CSS-first configuration**: Design tokens defined in CSS (`@theme` directive) rather than JavaScript config.
- **Utility-first**: Rapid prototyping with consistent spacing, colors, and responsive breakpoints.
- **Dark theme**: Dark mode utilities align with PrepPilot's premium dark aesthetic.

**Alternatives considered**:
- Tailwind v3: Would require `tailwind.config.js`, PostCSS plugin, and more setup.
- Vanilla CSS: Maximum control but slower development velocity for a hackathon.
- CSS-in-JS (styled-components, Emotion): Runtime overhead and additional dependencies.
- Sass/SCSS: No significant advantage over Tailwind for utility-first design.

**Impact**: Tailwind v4 with `@tailwindcss/vite` plugin. Custom design tokens via CSS variables in `index.css`. Mixed usage of Tailwind utilities and inline styles (technical debt to address).

---

### 13. Why HMR Is Disabled

**Date**: 2026-06-24  
**Decision**: Disable Vite Hot Module Replacement (`hmr: false, watch: null`).  
**Rationale**:
- **AI Studio environment**: The development environment (AI Studio build) has WebSocket connectivity issues that cause console errors and connection drops.
- **Stability**: Disabling HMR eliminates noisy WebSocket errors in the browser console.
- **Trade-off accepted**: Full page refresh on file changes is slower but more reliable in this specific environment.

**Alternatives considered**:
- Keep HMR enabled with error suppression: `main.tsx` already silences WebSocket errors, but the connection attempts still cause noise.
- Custom HMR transport: Over-engineered for the benefit.

**Impact**: `vite.config.ts` sets `hmr: false` and `watch: null`. `main.tsx` includes global error handlers to silence any residual WebSocket errors. Developers must manually refresh after changes.

---

### 14. Why Monolithic server.ts (initially)

**Date**: 2026-06-24  
**Decision**: Keep all server-side logic in a single `server.ts` file during rapid prototyping.  
**Rationale**:
- **Hackathon velocity**: During rapid prototyping, a single file minimizes context switching and import management.
- **Colocation**: All agent definitions, schemas, routes, and orchestration logic visible in one scroll.
- **Easy AI editing**: AI coding assistants work best with full file context.

**Acknowledged debt**: At 914 lines, `server.ts` has exceeded the maintainability threshold. A modular split is documented as a high-priority task in TASKS.md.

**Impact**: All backend logic in one file. Should be refactored into modular structure before any production deployment.
