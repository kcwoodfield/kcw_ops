# Lobo — AI Assistant for Ops
### Product Requirements Document

**Status:** Draft · **Author:** kcw · **Date:** 2026-05-22

---

## 1. Vision

Lobo is an embedded AI assistant that lives inside the Ops workspace. It understands your projects, sprints, epics, and stories — and can act on them. You talk to it, it reasons, it works, and then it waits patiently for the next move. Like a good boy.

Use it to draft tickets, break down epics, surface what's blocked, build a sprint plan from a brain dump, or just ask "what's left this sprint?" It never pushes. It never nags. It's there when you need it.

---

## 2. Goals

| Goal | Description |
|------|-------------|
| Embedded, not bolted on | Right panel on desktop, slide-in on mobile — part of the shell, not a separate app |
| Ops-aware by default | Lobo knows your active project, sprint, and team without you having to explain |
| Acts, doesn't just talk | Can create tickets, update stories, scaffold sprints — with your confirmation |
| Model-flexible | Claude API or local Ollama — switchable at any time |
| Graceful degradation | If the local model isn't running, offer options rather than breaking silently |

---

## 3. Non-Goals (for v1)

- Multi-user chat / team collaboration on a thread
- Persistent conversation history (ephemeral per session for now)
- Voice input
- Proactive suggestions / background analysis (Lobo only acts when spoken to)
- Billing or cost dashboards

---

## 4. User Stories

### Core flows

**As a PM**, I want to describe a feature in plain English and have Lobo break it into stories so I don't have to write them all by hand.

> "Lobo, we need to build a notification system. Create an epic and five starter stories in AUTH."

**As a developer**, I want to ask what's left in the current sprint without leaving the board.

> "What's blocked in Sprint 33?" → Lobo queries stories, returns a summary.

**As a solo operator**, I want to switch between Claude (better reasoning) and a local Llama (free, offline) depending on context.

> Toggle in the Lobo panel header. No reload required.

**As a user**, if I try to use the local model and Ollama isn't running, I want a clear modal that tells me what's wrong and lets me switch to Claude or fix the issue — not a silent failure.

---

## 5. UI / UX Spec

### 5.1 Entry point

- **Desktop:** Lobo icon button in the TopBar right side (dog paw or small shield-dog glyph — TBD). Clicking opens the right panel. Does NOT push content — overlays at a fixed width.
- **Mobile:** Same button in TopBar. Opens a full-height slide-in from the right (same pattern as the mobile sidebar).
- **State:** Panel open/closed stored in Zustand `ui` store. Persists across route changes.

### 5.2 Panel anatomy (desktop, ~400px)

```
┌─────────────────────────────────┐
│  Lobo          [Claude ▾] [✕]   │  ← header: title + model picker + close
├─────────────────────────────────┤
│                                 │
│  [context chip: AUTH · Sprint 33]│  ← active context, auto-injected
│                                 │
│  ···  (message thread)          │
│                                 │
│  ● Lobo                         │
│  ╭───────────────────────────╮  │
│  │ Found 3 blocked stories   │  │
│  │ in Sprint 33:             │  │  ← streaming response
│  │ AUTH-44 · AUTH-51 · ...   │  │
│  ╰───────────────────────────╯  │
│                                 │
├─────────────────────────────────┤
│  [  Ask Lobo anything...  ] [→] │  ← input bar, always visible
└─────────────────────────────────┘
```

### 5.3 Model picker

Dropdown in panel header. Options:

| Label | Value | Notes |
|-------|-------|-------|
| Claude Sonnet | `claude-sonnet` | Default. Best reasoning. Requires API key. |
| Claude Haiku | `claude-haiku` | Faster, cheaper for simple queries. |
| Local (Ollama) | `ollama` | Requires Ollama running locally. Model name configurable via env. |

Selection stored in `localStorage`. Survives page refresh.

### 5.4 Offline / unavailable model modal

Triggered when: user sends a message and the selected model is unreachable (Ollama not running, Claude key missing/invalid).

```
┌─────────────────────────────────────┐
│  Lobo can't reach the local model   │
│                                     │
│  Ollama doesn't appear to be        │
│  running. What would you like       │
│  to do?                             │
│                                     │
│  [Switch to Claude]  [Retry]        │
│  [Show me how to start Ollama]      │
└─────────────────────────────────────┘
```

- **Switch to Claude** — changes model picker to `claude-sonnet`, retries message
- **Retry** — pings Ollama again (gives user time to start it)
- **Show me how** — expands inline with: `ollama serve` + a link to ollama.ai

For missing Claude API key:
```
│  Claude API key not configured.     │
│  Add ANTHROPIC_API_KEY to your      │
│  .env file and restart the API.     │
```

---

## 6. Tool Surface (what Lobo can do)

Tools are defined on the backend and exposed to the model. The model decides when to call them.

### 6.1 Read tools

| Tool | Description | Underlying endpoint |
|------|-------------|---------------------|
| `list_projects` | All projects in workspace | `GET /api/projects` |
| `list_stories` | Stories in a project/sprint/epic | `GET /api/stories` |
| `get_story` | Full detail on a story | `GET /api/stories/{id}` |
| `list_epics` | Epics in a project | `GET /api/epics?projectId=` |
| `list_sprints` | Sprints in a project | `GET /api/sprints?projectId=` |
| `get_backlog` | Backlog stories (no sprint) | `GET /api/stories?backlogOnly=true` |
| `list_users` | Team members | `GET /api/users` |
| `get_activity` | Recent activity feed | `GET /api/activity?projectId=` |

### 6.2 Write tools

All write tools require user confirmation before executing (see §6.3).

| Tool | Description | Underlying endpoint |
|------|-------------|---------------------|
| `create_story` | Create a ticket | `POST /api/stories` |
| `update_story` | Change status, points, assignee, etc. | `PATCH /api/stories/{id}` |
| `create_epic` | Create an epic | `POST /api/epics` |
| `create_sprint` | Create a sprint | `POST /api/sprints` |
| `create_project` | Create a new project | `POST /api/projects` |
| `assign_story` | Assign to a user | `PATCH /api/stories/{id}` (`assigneeId`) |
| `move_to_sprint` | Move story from backlog → sprint | `PATCH /api/stories/{id}` (`sprintId`) |

### 6.3 Confirmation pattern

When Lobo decides to call a write tool, it proposes the action in chat before executing:

```
Lobo:  I'll create these 4 stories in AUTH under the "Notifications" epic:

       AUTH-?  Set up email service integration     [2 pts]
       AUTH-?  POST /api/notifications endpoint     [3 pts]
       AUTH-?  Notification preferences UI          [2 pts]
       AUTH-?  In-app bell icon + badge count       [1 pt]

       [Create all]  [Edit]  [Cancel]
```

User clicks **Create all** → Lobo executes sequentially, updates the UI via TanStack Query cache invalidation.

---

## 7. Architecture

### 7.1 Overview

```
Frontend (React)
  LoboPanel.tsx
    ├── sends POST /api/ai/chat  (SSE stream)
    └── renders streaming tokens

Backend (.NET)
  AiController.cs
    ├── POST /api/ai/chat
    │     ├── builds system prompt (active project context)
    │     ├── routes to Claude SDK or Ollama HTTP client
    │     ├── runs tool-calling loop
    │     └── streams SSE back to client
    └── GET /api/ai/health?model=ollama|claude
```

### 7.2 Backend: `/api/ai/chat`

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "What's blocked in Sprint 33?" }],
  "model": "claude-sonnet",
  "projectId": "uuid"
}
```

**Response:** Server-Sent Events stream
```
data: {"type":"text","delta":"Found "}
data: {"type":"text","delta":"3 blocked stories"}
data: {"type":"tool_call","tool":"list_stories","input":{...}}
data: {"type":"tool_result","tool":"list_stories","output":[...]}
data: {"type":"text","delta":"Here's what's blocked..."}
data: {"type":"done"}
```

**Tool-calling loop (backend):**
1. Build initial messages with system prompt
2. Call model (Claude SDK or Ollama)
3. If model returns a tool call → execute it against Ops API → append result → continue
4. When model returns final text → stream tokens to client
5. Repeat until no more tool calls

### 7.3 System prompt

Injected on every request:

```
You are Lobo, an AI assistant embedded in the Ops project management tool.
You are precise, patient, and action-oriented. You help the user manage their
projects, sprints, and stories.

Current context:
- Active project: {project.name} ({project.key})
- Current sprint: {sprint.name} (ends {sprint.endDate})
- Sprint stories: {openCount} open, {blockedCount} blocked, {doneCount} done
- Team: {users list}

Use your tools to answer questions and take actions. For write operations,
always show the user what you plan to do before executing. Be concise.
```

### 7.4 Model routing

```csharp
// Feature/Ai/Chat/ChatHandler.cs
if (request.Model.StartsWith("ollama"))
    return await _ollamaClient.ChatAsync(messages, tools);
else
    return await _anthropicClient.ChatAsync(model, messages, tools);
```

### 7.5 Health check

`GET /api/ai/health?model=ollama` — pings `http://localhost:11434/api/version`. Returns `{ available: true/false, model: "..." }`. Frontend calls this before the first message to decide whether to show the unavailable modal.

### 7.6 Transport

SSE (Server-Sent Events) over HTTP — simpler than WebSockets, works with standard `fetch` + `ReadableStream` in the browser. No extra infrastructure.

---

## 8. Configuration

All config via environment variables (never hardcoded):

| Variable | Required for | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude models | — |
| `LOBO_DEFAULT_MODEL` | Initial model on first load | `claude-sonnet` |
| `OLLAMA_BASE_URL` | Local Ollama | `http://localhost:11434` |
| `OLLAMA_MODEL` | Which local model to use | `llama3.2` |

---

## 9. Build Plan

| Phase | Work | Notes |
|-------|------|-------|
| **L1** | Backend scaffold | `AiController`, tool definitions, Claude streaming, health endpoint |
| **L2** | Frontend panel | `LoboPanel.tsx`, model picker, SSE streaming renderer, Zustand state |
| **L3** | Read tools | All 8 read tools wired + tested |
| **L4** | Write tools + confirmation | Create/update flows with confirm UI |
| **L5** | Ollama support | Model routing, health check, unavailable modal |
| **L6** | Polish | Streaming UX, error states, keyboard shortcut to open panel |

---

## 10. Open Questions

| # | Question | Options |
|---|----------|---------|
| 1 | **Conversation persistence** — save chat history to DB or ephemeral per session? | Ephemeral for v1, optional DB persistence later |
| 2 | **Rate limiting** — Claude API costs real money. Limit per-session? | Hard cap in API (e.g., 20 messages/hour) |
| 3 | **Tool confirmation granularity** — confirm each write, or batch + confirm once? | Batch for v1 |
| 4 | **Panel keyboard shortcut** — what key opens Lobo? | `⌘L` or `⌘\` |
| 5 | **Lobo icon / glyph** — dog paw? custom shield-wolf? | TBD design |
| 6 | **Ollama model selection** — let user pick from installed models or fixed via env? | Fixed via `OLLAMA_MODEL` env for v1 |

---

## 11. Success Criteria (v1)

- [ ] User can open Lobo panel from any view
- [ ] "What's blocked this sprint?" returns accurate answer using live data
- [ ] "Create 3 stories for X" proposes stories, user confirms, tickets appear in backlog
- [ ] Switching from Ollama → Claude mid-conversation works without reload
- [ ] If Ollama is not running, modal appears with clear options within 2 seconds
- [ ] Panel works on mobile (slide-in, full height, input above keyboard)
