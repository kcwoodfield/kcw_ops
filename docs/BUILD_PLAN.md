# kcw / ops — Build Plan

Living roadmap from prototype → production app. Design reference: [`docs/design/index.html`](design/index.html). Agent context: [`CLAUDE.md`](../CLAUDE.md).

**Last updated:** 2026-05-20 (Phase 2 complete)

---

## Progress at a glance

| Milestone | Status |
|-----------|--------|
| Infra + seed data | ✅ |
| Read API (programs → stories) | ✅ |
| Story CRUD API (GET/PATCH/POST) | ✅ |
| App shell + live Kanban | ✅ |
| Story drawer + inline edits | ✅ |
| **URL routing (`react-router-dom`)** | ✅ |
| Kanban drag-and-drop | ✅ `@dnd-kit/core` |
| ⌘K command palette | ✅ |
| Backlog / planning / list views | ✅ |
| Auth | ⬜ |

---

## Current state

| Layer | Status |
|-------|--------|
| Postgres (Docker `:5435`) | Done — `docker compose up -d` |
| .NET API (`:5050`) | Done — dev migrate + seed on startup |
| Read API | Done — programs, sprints, epics, stories (incl. `backlogOnly`) |
| Write API | Partial — `CreateStory`, `UpdateStory` (no delete, batch, or sprint transitions) |
| React app (`:5175`) | Partial — shell, routed views, Kanban, story drawer |
| Client routing | Done — `react-router-dom` v7 |
| Design prototype | Done — 8 surfaces in `docs/design/` |
| Auth | Not started |

### Surface checklist (design → app)

| # | Surface | Design | Frontend | API |
|---|---------|--------|----------|-----|
| 01 | App shell + Kanban | ✅ | 🟡 board + drawer + DnD | 🟡 GET/PATCH stories |
| 02 | Sprint planning | ✅ | ✅ DnD, capacity meter, start/complete/delete sprint | ✅ GET/PATCH/DELETE sprints |
| 03 | Backlog table | ✅ | ✅ table, filters, checkboxes, move-to-sprint | ✅ GET `backlogOnly` |
| 04 | List (by Epic) | ✅ | ✅ epic groups, progress bars, inline edit/delete | ✅ GET epics + stories |
| 05 | Calendar / Gantt | ✅ | 🟡 `/calendar` placeholder | ⬜ date-range query |
| 06 | Story detail drawer | ✅ | 🟡 drawer + edits; `?story=` deep link | 🟡 GET/PATCH story |
| 07 | Activity log | ✅ | ⬜ `/activity` not in router yet | ⬜ Activity entity + feed |
| 08 | Sign in | ✅ | ⬜ | ⬜ auth |

Legend: ✅ done · 🟡 partial · ⬜ not started

---

## Architecture constraints (from CLAUDE.md)

- **Backend:** vertical slices under `api/Features/{Entity}/{UseCase}/` — Command or Query + Handler + Validator + thin Controller
- **CQRS:** reads never mutate; writes never return projection graphs
- **Frontend:** Shadcn + lucide-react; TanStack Query for server data
- **Routing:** `react-router-dom` — project + view in path; sprint + story in search params ([details](#client-routing))
- **Zustand:** `activeProjectId` / `activeSprintId` synced from URL in `AppShell` (not view or drawer state)
- **Story drawer:** Radix Dialog ~860px; open via `?story=<uuid>`
- **Points:** Fibonacci only — 1 2 3 5 8 13 21
- **Public repo:** no real PII; fictional design names are OK

---

## Client routing

**Library:** `react-router-dom` v7 · **Helpers:** `web/src/lib/routes.ts`, `web/src/hooks/useAppNavigate.ts`

### URL contract

```
/                                    → redirect to last project (localStorage) or AUTH
/p/:projectKey/board?sprint=<uuid>&story=<uuid>
/p/:projectKey/backlog
/p/:projectKey/planning
/p/:projectKey/list
/p/:projectKey/calendar
/login                               → Phase 5 (not wired)
/p/:projectKey/activity              → Phase 4 (route TBD)
```

| Param | Example | Maps to |
|-------|---------|---------|
| `:projectKey` | `AUTH` | Resolve → `activeProjectId` via programs |
| view segment | `board` | Kanban, backlog table, etc. |
| `?sprint=` | UUID | Sprint filter (board); default active sprint injected if missing |
| `?story=` | UUID | Story drawer open; Back/Esc removes param |

### Route table (implemented)

| Path | Component | Notes |
|------|-----------|-------|
| `/` | `<RootRedirect />` | `kcw_last_project_key` in localStorage |
| `/p/:projectKey` | redirect → `board` | |
| `/p/:projectKey/board` | `Kanban` | |
| `/p/:projectKey/backlog` | `ViewPlaceholder` | replace with `Backlog` in Phase 2 |
| `/p/:projectKey/planning` | `ViewPlaceholder` | replace with `SprintPlanning` |
| `/p/:projectKey/list` | `ViewPlaceholder` | replace with `ListView` |
| `/p/:projectKey/calendar` | `ViewPlaceholder` | replace with `CalendarView` |

`AppShell` uses `<Outlet />`; `StoryDrawer` is global (outside nested routes).

### Navigation API (`useAppNavigate`)

- `goToProject(key, view?)` — switch project; preserves sprint/story unless overridden
- `goToView(view)` — TopBar Board / List / Calendar
- `setSprint(id)` — updates `?sprint=`
- `openStory(id)` / `closeStory()` — `?story=` add/remove

Sidebar: project rows → `goToProject`; Inbox → `backlog`; Sprint planning → `planning`; Releases → `calendar`.

### Routing checklist ✅ (2026-05-20)

- [x] `BrowserRouter` in `main.tsx`
- [x] Route table in `App.tsx`
- [x] `AppShell` + URL ↔ Zustand sync
- [x] TopBar + Sidebar use `navigate` / `useAppNavigate`
- [x] Story drawer deep-linked
- [ ] `/activity` route + sidebar link
- [ ] `/login` route (Phase 5)

---

## Phase 1 — Interactive core (in progress)

Goal: click a card → edit story → **drag across columns**. Minimum usable board.

### 1.1 API — story commands ✅ (2026-05-20)

| Slice | Endpoint | Status |
|-------|----------|--------|
| `GetStory` | `GET /api/stories/{id}` | ✅ |
| `CreateStory` | `POST /api/stories` | ✅ |
| `UpdateStory` | `PATCH /api/stories/{id}` | ✅ |

Validators: Fibonacci points; status/priority enums; epic/sprint belong to project.

### 1.2 API — supporting reads

| Slice | Endpoint | Notes |
|-------|----------|-------|
| `GetProject` | `GET /api/projects/{id}` | Optional; programs payload may suffice |
| Users / assignees | `GET /api/users` or story DTO | Replace GUID avatar hack; seed fictional users |

### 1.3 Frontend — story drawer (surface 06) ✅ (2026-05-20)

- [x] `StoryDrawer` — Radix Dialog
- [x] `useStory` + `useUpdateStory` + `useCreateStory`
- [x] Open from Kanban; deep link `?story=`
- [x] Edits: title, description, status, priority, points, blocked
- [x] New issue → create + open drawer

### 1.4 Frontend — Kanban interactions (surface 01) ✅ (2026-05-20)

- [x] Drag-and-drop — `@dnd-kit/core` + `@dnd-kit/sortable`
- [x] Drop across columns → `PATCH` status + optimistic cache update
- [x] Reorder within column → `POST /api/stories/reorder` + optimistic update
- [x] Column counts / point totals
- [x] New issue + sprint selector (URL-backed)
- [x] 6px activation distance so click still opens drawer

### 1.5 Frontend — keyboard ✅ (2026-05-20)

- [x] `⌘K` command palette — `cmdk` primitives + Radix Dialog; search stories, jump views, project switch, create story
- [x] `C` → opens palette (wire global shortcut when no input focused)
- [x] `Esc` → close drawer (`?story=` cleared)

**Phase 1 exit criteria:** Create AUTH-###, drag todo → done, edit in drawer, **refresh restores** `/p/AUTH/board?sprint=…&story=…`. ✅

---

## Phase 2 — Planning & backlog views

Goal: replace placeholders at `/backlog`, `/planning`, `/list` with real surfaces.

### 2.1 Backlog (surface 03) ✅ (2026-05-20)

- [x] `Backlog.tsx` — dense table with filters and checkboxes
- [x] `useBacklog(projectId)` — hook
- [x] Checkbox multi-select + “Move to sprint” bulk action
- [x] Route + sidebar Inbox link

### 2.2 Sprint planning (surface 02) ✅ (2026-05-20)

- [x] `SprintPlanning.tsx` — split pane + capacity meter + DnD
- [x] Drag stories between backlog ↔ sprint
- [x] `StartSprint` / `CompleteSprint` via PATCH state
- [x] Route + sidebar link

### 2.3 List view (surface 04) ✅ (2026-05-20)

- [x] `ListView.tsx` — group by epic, progress bars, inline edit/delete
- [x] `useEpics` — hook
- [x] Route + TopBar “List” link

**Phase 2 exit criteria:** Move backlog items into Sprint 33 at `/p/AUTH/planning`; see board + list update.

---

## Phase 3 — Timeline & workspace chrome

### 3.1 Calendar / Gantt (surface 05)

- [ ] `CalendarView.tsx` at `/p/:projectKey/calendar`
- [ ] `GET /api/stories?projectId=&from=&to=`

### 3.2 App shell polish

- [x] Sidebar primary routes wired
- [x] `/` → last project redirect
- [ ] `/p/:projectKey/activity` route
- [ ] Per-route loading / error boundaries
- [ ] Empty states (no sprints, empty board)

### 3.3 Programs / projects CRUD

- [ ] Create program, project, epic
- [ ] Navigate to `/p/{key}/board` on create

---

## Phase 4 — Activity & collaboration

### 4.1 Activity log (surface 07)

- [ ] `ActivityEvent` domain + `GET /api/activity`
- [ ] `ActivityLog.tsx` + `/activity` route

### 4.2 Comments (drawer)

- [ ] `Comment` entity + POST endpoint
- [ ] Thread in drawer

### 4.3 Real assignees

- [ ] `User` entity + seed personas (fictional names only)

---

## Phase 5 — Auth (surface 08)

- [ ] `LoginPage` at `/login`
- [ ] API auth + route guards
- [ ] Env-based API URL for production

---

## Phase 6 — Production quality

- [ ] CI: `dotnet test`, `npm run build`, lint
- [ ] API integration tests (WebApplicationFactory)
- [ ] E2E: Playwright — `/p/AUTH/board`, `?story=`, DnD, browser back
- [ ] Docker Compose: api + web + db
- [ ] Story list pagination if >200 cards
- [ ] a11y: drawer focus trap, DnD live regions

---

## Suggested build order

```
2.1 Backlog                        ← current focus
2.2 Sprint planning
2.3 List view
3.1 Calendar
3.2 activity route + shell polish
4.x Activity + comments
5 Auth
6 CI / E2E
```

---

## Key files

| Area | Path |
|------|------|
| API entry | `api/Program.cs` |
| Story slices | `api/Features/Stories/` |
| Routes | `web/src/App.tsx` |
| Route helpers | `web/src/lib/routes.ts`, `web/src/hooks/useAppNavigate.ts` |
| Layout | `web/src/components/layout/` |
| Kanban | `web/src/components/kanban/Kanban.tsx` |
| Story drawer | `web/src/components/story/StoryDrawer.tsx` |
| Placeholders | `web/src/components/shared/ViewPlaceholder.tsx` |
| API hooks | `web/src/api/` |
| UI store | `web/src/store/ui.ts` |
| Design tokens | `web/src/index.css`, `docs/design/tokens.css` |

---

## Running locally

```bash
docker compose up -d
dotnet run --project api          # http://localhost:5050
cd web && npm run dev             # http://localhost:5175
```

**Example URLs:**

```
http://localhost:5175/
http://localhost:5175/p/AUTH/board
http://localhost:5175/p/AUTH/board?sprint=<uuid>&story=<uuid>
http://localhost:5175/p/AUTH/backlog
http://localhost:5175/p/AUTH/planning
```

Design prototype only:

```bash
cd docs/design && python3 -m http.server 8080
```

---

## Out of scope (for now)

- Multi-tenant / org billing
- Notifications, email, webhooks
- GitHub PR links in UI (activity feed may reference merges later)
- Mobile native apps
- Real-time multiplayer cursors

Revisit after Phase 2 is usable day-to-day.
