# kcw / ops — Build Plan

Living roadmap from prototype → production app. Design reference: [`docs/design/index.html`](design/index.html). Agent context: [`CLAUDE.md`](../CLAUDE.md).

**Last updated:** 2026-05-20

---

## Current state

| Layer | Status |
|-------|--------|
| Postgres (Docker `:5435`) | Done — `docker compose up -d` |
| .NET API (`:5050`) | Done — dev migrate + seed on startup |
| Read API | Done — programs, sprints, epics, stories (incl. backlog filter) |
| Write API | Not started — no Commands yet |
| React app (`:5175`) | Partial — shell + read-only Kanban |
| Design prototype | Done — 8 surfaces in `docs/design/` |
| Auth | Not started |

### Surface checklist (design → app)

| # | Surface | Design | Frontend | API |
|---|---------|--------|----------|-----|
| 01 | App shell + Kanban | ✅ | 🟡 Kanban read-only; shell wired | 🟡 GET stories |
| 02 | Sprint planning | ✅ | ⬜ placeholder nav | 🟡 GET sprints |
| 03 | Backlog table | ✅ | ⬜ | 🟡 GET stories `backlogOnly` |
| 04 | List (by Epic) | ✅ | ⬜ placeholder view | 🟡 GET epics + stories |
| 05 | Calendar / Gantt | ✅ | ⬜ placeholder view | ⬜ needs date-range query |
| 06 | Story detail drawer | ✅ | ⬜ | ⬜ GET story by id |
| 07 | Activity log | ✅ | ⬜ | ⬜ needs Activity entity + feed |
| 08 | Sign in | ✅ | ⬜ | ⬜ needs auth |

Legend: ✅ done · 🟡 partial · ⬜ not started

---

## Architecture constraints (from CLAUDE.md)

- **Backend:** vertical slices under `api/Features/{Entity}/{UseCase}/` — Command or Query + Handler + Validator + thin Controller
- **CQRS:** reads never mutate; writes never return projection graphs
- **Frontend:** Shadcn first, lucide-react icons, TanStack Query for server state, Zustand for UI (`activeProject`, `view`, `activeSprint`, drawer open/id)
- **Story drawer:** Shadcn `Sheet`, `side="right"`, 720–920px
- **Points:** Fibonacci only — 1 2 3 5 8 13 21
- **Public repo:** no real PII; fictional design names are OK

---

## Phase 1 — Interactive core (next)

Goal: click a card → edit story → drag across columns. This is the minimum usable board.

### 1.1 API — story commands

| Slice | Endpoint | Notes |
|-------|----------|-------|
| `GetStory` | `GET /api/stories/{id}` | Full detail for drawer (description, labels, blocked, etc.) |
| `CreateStory` | `POST /api/stories` | Allocate `{ProjectKey}-{n}` via max(Number)+1 per project |
| `UpdateStory` | `PATCH /api/stories/{id}` | Title, status, priority, points, epic, sprint, assignee, blocked, due, labels |
| `MoveStory` | optional thin wrapper or part of UpdateStory | Status change + optional sprint assignment |

Validators: Fibonacci points, enum status/priority, epic/sprint belong to same project.

### 1.2 API — supporting reads

| Slice | Endpoint | Notes |
|-------|----------|-------|
| `GetProject` | `GET /api/projects/{id}` | Optional; may fold into programs payload |
| Users / assignees | `GET /api/users` or embed in story DTO | Design uses avatars; seed a `User` table or static map until auth |

### 1.3 Frontend — story drawer (surface 06)

- [ ] `StoryDetail` Sheet component from design
- [ ] `useStory(id)` query + `useUpdateStory` mutation
- [ ] Open drawer from Kanban card click; Zustand: `storyDrawerId`
- [ ] Inline edits: status, priority, points, title, blocked toggle
- [ ] Optimistic updates + query invalidation (`stories`, `sprints`)

### 1.4 Frontend — Kanban interactions (surface 01)

- [ ] Drag-and-drop between columns (status) — `@dnd-kit/core` or native HTML DnD
- [ ] Drop → `PATCH` status
- [ ] Column counts / point totals (already computed client-side)
- [ ] “New issue” → create flow (modal or drawer empty state)
- [ ] Sprint selector in TopBar (change `activeSprintId` — chip exists, no picker yet)

### 1.5 Frontend — keyboard

- [ ] `⌘K` command palette (Shadcn `Command`) — search issues, switch project/view
- [ ] `C` new issue (TopBar hint already shown)

**Phase 1 exit criteria:** Create AUTH-### story, drag todo → done, open drawer and edit fields, refresh persists.

---

## Phase 2 — Planning & backlog views

Goal: sprint planning and backlog match design surfaces 02–04.

### 2.1 Backlog (surface 03)

- [ ] `Backlog.tsx` — dense table, sortable columns, bulk select (later)
- [ ] `useBacklog(projectId)` — already stubbed in `api/stories.ts`
- [ ] Drag row → sprint assignment (calls UpdateStory)
- [ ] Sidebar “Inbox” / backlog route or view mode in store

### 2.2 Sprint planning (surface 02)

- [ ] `SprintPlanning.tsx` — split pane: backlog list | sprint scope
- [ ] Capacity meter from sprint `committedPoints` / team velocity (seed or config)
- [ ] `AssignSprintStories` command — batch move stories into sprint
- [ ] Start / complete sprint commands (`SprintState` transitions)

### 2.3 List view (surface 04)

- [ ] `ListView.tsx` — group by epic, collapse sections, progress pts per epic
- [ ] `useEpics` hook + stories grouped client-side or `GET /api/epics?includeStories=true`

**Phase 2 exit criteria:** Plan Sprint 33 from backlog, see updates on Kanban and List.

---

## Phase 3 — Timeline & workspace chrome

### 3.1 Calendar / Gantt (surface 05)

- [ ] `CalendarView.tsx` — stories on timeline by `DueDate` / sprint bounds
- [ ] API: `GET /api/stories?projectId=&from=&to=` date filter
- [ ] Epic swimlanes optional v2

### 3.2 App shell polish

- [ ] Sidebar view links wired (`Sprint planning`, etc.) to `useUiStore.view`
- [ ] Breadcrumb + project switcher persistence (localStorage)
- [ ] Loading / error boundaries per view
- [ ] Empty states per project with no sprints

### 3.3 Programs / projects CRUD

- [ ] Create program, project, epic (admin-lite, no roles yet)
- [ ] Project key uniqueness validation

---

## Phase 4 — Activity & collaboration

### 4.1 Activity log (surface 07)

- [ ] Domain: `ActivityEvent` (actor, type, target, payload, timestamp)
- [ ] Emit events from story/sprint handlers (MediatR pipeline behavior or domain events)
- [ ] `GET /api/activity?projectId=&cursor=`
- [ ] `ActivityLog.tsx` — day groups, filters, sparkline header

### 4.2 Comments (drawer tab)

- [ ] `Comment` entity + `POST /api/stories/{id}/comments`
- [ ] Thread in StoryDetail drawer

### 4.3 Real assignees

- [ ] `User` entity (id, display name, initials, color) — replace GUID avatar hack
- [ ] Seed users matching design personas (fictional names only)

---

## Phase 5 — Auth & hardening (surface 08)

- [ ] `LoginPage.tsx` — design surface 08 (can defer OAuth; start with dev-only cookie)
- [ ] ASP.NET Identity or simple API key / magic link for single-user local mode
- [ ] Protect write endpoints; read-only public demo mode optional
- [ ] CORS + env-based API URL for production build

---

## Phase 6 — Production quality

- [ ] CI: `dotnet test`, `npm run build`, lint
- [ ] EF migrations workflow documented; no manual schema drift
- [ ] API integration tests per slice (WebApplicationFactory)
- [ ] E2E smoke: Playwright — load board, open story, change status
- [ ] Docker Compose profile: api + web + db (optional)
- [ ] Performance: story list pagination if >200 cards
- [ ] Accessibility pass on Shadcn components (focus trap in Sheet, kanban DnD announcements)

---

## Suggested build order (single-threaded)

```
Phase 1.1 GetStory + UpdateStory API
    → 1.3 Story drawer
    → 1.4 Kanban DnD + create story
    → 1.5 ⌘K palette
Phase 2.1 Backlog
    → 2.2 Sprint planning
    → 2.3 List view
Phase 3.1 Calendar
    → 3.2 Shell polish
Phase 4.1 Activity log
    → 4.2 Comments
Phase 5 Auth
Phase 6 CI / tests / deploy
```

Parallelizable later: Calendar vs Activity; Comments vs Auth.

---

## Key files (today)

| Area | Path |
|------|------|
| API entry | `api/Program.cs` |
| Domain | `api/Domain/Entities.cs` |
| Seed data | `api/Infrastructure/Persistence/DataSeeder.cs` |
| Read slices | `api/Features/{Programs,Stories,Sprints,Epics}/` |
| Query client | `web/src/api/client.ts` |
| UI state | `web/src/store/ui.ts` |
| Layout | `web/src/components/layout/` |
| Kanban | `web/src/components/kanban/Kanban.tsx` |
| Design tokens | `web/src/index.css`, `docs/design/tokens.css` |

---

## Running locally (verify any phase)

```bash
docker compose up -d
dotnet run --project api          # http://localhost:5050
cd web && npm run dev             # http://localhost:5175
```

Design-only preview:

```bash
cd docs/design && python3 -m http.server 8080
```

---

## Out of scope (for now)

- Multi-tenant / org billing
- Notifications, email, webhooks
- GitHub PR integration (design shows merge events — activity feed only)
- Mobile native apps
- Real-time multiplayer cursors

These can be revisited after Phase 2 feels good day-to-day.
