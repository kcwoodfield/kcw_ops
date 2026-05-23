# kcw / ops — Build Plan

Living roadmap from prototype → production app. Design reference: [`docs/design/index.html`](design/index.html). Agent context: [`CLAUDE.md`](../CLAUDE.md).

**Last updated:** 2026-05-23 (Phase 5 complete · auth shipped · audit pass landed)

---

## Progress at a glance

| Milestone | Status |
|-----------|--------|
| Infra + seed data | ✅ |
| Read API (projects → stories) | ✅ |
| Story CRUD API (GET/PATCH/POST/DELETE) | ✅ |
| App shell + live Kanban | ✅ |
| Story drawer + inline edits | ✅ |
| URL routing (`react-router-dom`) | ✅ |
| Kanban drag-and-drop | ✅ `@dnd-kit/core` |
| ⌘K command palette | ✅ |
| Backlog / planning / list / roadmap views | ✅ |
| ~~Calendar / Gantt~~ | 🗑️ removed |
| Activity log + comments + assignees | ✅ |
| Auth (JWT + TOTP) | ✅ |
| AI assistant ("Lobo") with tool-use | ✅ |
| Audit cleanup pass | ✅ ([`docs/AUDIT.md`](AUDIT.md)) |
| Audit follow-up minors | 🟡 in progress |
| Production quality (CI, tests, E2E) | ⬜ Phase 6 |

---

## Current state

| Layer | Status |
|-------|--------|
| Postgres (Docker `:5435`, compose project `kcw_ops`) | Done — `docker compose up -d` |
| .NET API (`:5050`) | Done — dev migrate + seed on startup |
| Read API | Done — projects, sprints, epics, stories, users, activity |
| Write API | Done — full CRUD for stories; sprint lifecycle; comments; assignees |
| React app (`:5175`) | Done — Kanban, Backlog, Planning, List, Roadmap, Activity, Drawer |
| Client routing | Done — `react-router-dom` v7 |
| Validation | Done — FluentValidation via MediatR `ValidationBehavior` + ProblemDetails |
| AI / Lobo | Done — SSE stream, tool-use routed through MediatR commands |
| Auth | Done — JWT access token, httpOnly refresh, TOTP 2FA, rate-limited |
| Design prototype | Done — 8 surfaces in `docs/design/` |

### Surface checklist (design → app)

| # | Surface | Frontend | API |
|---|---------|----------|-----|
| 01 | App shell + Kanban | ✅ board + drawer + DnD | ✅ GET/PATCH/DELETE stories |
| 02 | Sprint planning | ✅ DnD, capacity meter, start/complete/delete sprint | ✅ GET/PATCH/DELETE sprints |
| 03 | Backlog table | ✅ table, filters, checkboxes, move-to-sprint | ✅ GET `backlogOnly` |
| 04 | List (by Epic) | ✅ epic groups, progress bars, inline edit/delete | ✅ GET epics + stories |
| 05 | ~~Calendar / Gantt~~ | 🗑️ removed (`664f94a`) | — |
| —  | Roadmap (epic timeline) | ✅ `RoadmapView` | ✅ epic dates on `UpdateEpic` |
| 06 | Story detail drawer | ✅ drawer + edits + comments + assignee | ✅ GET/PATCH story + comments |
| 07 | Activity log | ✅ day-grouped feed, sparkline, `/activity` route | ✅ Activity entity + GET feed |
| 08 | Sign in | ✅ `LoginPage` with password + TOTP | ✅ JWT + TOTP + refresh + rate-limit |

Legend: ✅ done · 🟡 partial · ⬜ not started · 🗑️ removed

---

## Architecture constraints (from CLAUDE.md)

- **Backend:** vertical slices under `api/Features/{Entity}/{UseCase}/` — Command/Query + Handler + Validator. Endpoints live in `api/Controllers/` (single exception: `AuthController` inside its slice). Doc inconsistency tracked under audit follow-ups.
- **CQRS:** reads never mutate; writes never return projection graphs
- **Validation:** FluentValidation runs in a MediatR `ValidationBehavior` pipeline; `ValidationException` → 400 via `IExceptionHandler` + ProblemDetails (intentionally unconditional — JSON API)
- **AI writes:** `ToolExecutor` sends MediatR commands so REST and AI paths share one implementation
- **Frontend:** Shadcn + lucide-react; TanStack Query for server data
- **Routing:** `react-router-dom` v7 — project + view in path; sprint + story in search params ([details](#client-routing))
- **Zustand:** `activeProjectId` / `activeSprintId` mirrored from URL in `AppShell` (known drift-prone — see audit follow-ups)
- **Story drawer:** Radix Dialog ~860px; open via `?story=<uuid>`
- **Points:** Fibonacci only — 1 2 3 5 8 13 21, enforced by the validation pipeline
- **Public repo:** no real PII; fictional design names are OK

---

## Client routing

**Library:** `react-router-dom` v7 · **Helpers:** `web/src/lib/routes.ts`, `web/src/hooks/useAppNavigate.ts`

### URL contract

```
/                                          → redirect to last project (localStorage) or first
/login                                     → unauth surface (route guard handles redirects)
/inbox · /my-issues · /starred · /drafts   → cross-project workspace views
/p/:projectKey/board?sprint=<uuid>&story=<uuid>
/p/:projectKey/backlog
/p/:projectKey/planning
/p/:projectKey/list
/p/:projectKey/roadmap
/p/:projectKey/activity
```

| Param | Example | Maps to |
|-------|---------|---------|
| `:projectKey` | `HIST` | Resolve → `activeProjectId` |
| view segment | `board` | Kanban, backlog table, etc. |
| `?sprint=` | UUID | Sprint filter; default active sprint injected if missing. Cleared on project switch. |
| `?story=` | UUID | Story drawer open; Back/Esc removes param. Cleared on project switch. |

### Route table (implemented)

| Path | Component |
|------|-----------|
| `/` | `<RootRedirect />` (`kcw_last_project_key` in localStorage) |
| `/login` | `LoginPage` |
| `/inbox` · `/my-issues` · `/starred` · `/drafts` | `WorkspaceShell` + cross-project view |
| `/p/:projectKey` | redirect → `board` |
| `/p/:projectKey/board` | `Kanban` |
| `/p/:projectKey/backlog` | `Backlog` |
| `/p/:projectKey/planning` | `SprintPlanning` |
| `/p/:projectKey/list` | `ListView` |
| `/p/:projectKey/roadmap` | `RoadmapView` |
| `/p/:projectKey/activity` | `ActivityLog` |

`AppShell` uses `<Outlet />`; `StoryDrawer` is global (outside nested routes).

### Navigation API (`useAppNavigate`)

- `goToProject(key, view?)` — switch project; **drops sprint/story when crossing a project boundary**
- `goToView(view)` — preserves sprint/story
- `setSprint(id)` — updates `?sprint=`
- `openStory(id)` / `closeStory()` — `?story=` add/remove

---

## Phase 1 — Interactive core ✅ (2026-05-20)

Story slices (`GetStory`, `CreateStory`, `UpdateStory`, `DeleteStory`, `ReorderStories`) · `StoryDrawer` with deep-link · `@dnd-kit` board · ⌘K palette · keyboard shortcuts (`C`, `Esc`, `⌘+Enter`).

## Phase 2 — Planning & backlog views ✅ (2026-05-20)

`Backlog.tsx` · `SprintPlanning.tsx` (DnD + capacity meter) · `ListView.tsx`.

## Phase 3 — Timeline & workspace chrome

- ~~3.1 Calendar / Gantt~~ — **removed** in `664f94a` (sparse + duplicative with Roadmap)
- 3.2 App shell polish ✅
- 3.3 Projects / epics / sprints CRUD ✅
- 3.4 Roadmap ✅ — `RoadmapView` with editable epic start/end dates

## Phase 4 — Activity & collaboration ✅ (2026-05-21)

Activity feed (status/points/sprint/assignee/sprint-lifecycle/comment events) · story comments · `User` entity + assignee picker.

## Phase 5 — Auth ✅ (2026-05-21)

- `POST /auth/setup` (dev-only) — bcrypt hash + TOTP QR enrollment
- `POST /auth/login` → temp token; `POST /auth/verify` → JWT + httpOnly refresh cookie
- `POST /auth/refresh` / `POST /auth/logout`
- Rate limiting on `/auth/*` (10 req / 15 min per IP)
- `[Authorize]` on all data controllers
- CORS locked to `AllowedOrigin` env var
- `LoginPage` — two-step (password → TOTP); silent refresh on 401
- `VITE_API_URL` env var

Reference: [`docs/AUTH_PLAN.md`](AUTH_PLAN.md)

## Phase 5.5 — Lobo (AI assistant) ✅

- SSE-streamed chat panel (`LoboPanel`) with `⌘L` toggle, `Esc` collapse
- Model toggle: Claude Sonnet / Haiku / local Ollama
- Tool-use: list/get/create/update for projects, epics, sprints, stories, users
- Writes flow through MediatR commands (single implementation for REST + AI)
- Offline detection with retry / switch-model modal
- Persisted chat history in localStorage (last 100 messages)

Reference: [`docs/LOBO_PRD.md`](LOBO_PRD.md)

## Phase 5.9 — Audit cleanup pass ✅ (2026-05-22 → 2026-05-23)

Findings catalogued in [`docs/AUDIT.md`](AUDIT.md). Headline fixes shipped:

- Missing `class-variance-authority` dependency — added (frontend was unbuildable)
- Dropped sprint/story URL params on fallback redirect — mapped correctly
- `Section` drawer `trail` prop — actually rendered now
- Unused imports, dead `programs.ts`, deprecated `View` type, `ViewPlaceholder` — removed
- `useAppView` reimplemented view list omitting `roadmap` — now delegates to `isAppView`
- FluentValidation pipeline wired through MediatR + ProblemDetails handler
- AI `ToolExecutor` story writes routed through MediatR (was a forked write path that had already drifted — no activity events, no sprint-ownership check)
- AI `create_story` empty-string `assigneeId` no longer fires a spurious activity event
- Compose project renamed to `kcw_ops`; volume tidied to `kcw_ops_data`
- Browser tab title → `Ops`
- Lobo collapses on `Esc`
- Cross-project URL-leak fixed; `activeSprintId` clears with URL

---

## Audit follow-ups (minors — current focus)

Deferred items from [`docs/AUDIT.md`](AUDIT.md) §6.

| Item | Direction | Status |
|------|-----------|--------|
| Redundant `Project` reload in `UpdateStoryHandler:107` | Delete the line | ⬜ |
| Latent `EpicId = Guid.Empty` on epic-less project | Auto-create default epic on `CreateProject` | ⬜ |
| Duplicated 401-refresh in `client.ts` | Unify `request()` and `get()` into one fetch core | ⬜ |
| `Controllers/` folder vs vertical-slice endpoints | Acknowledge controllers as canonical; document the exception | ⬜ |
| Routing state mirror in `store/ui.ts` | Drop `activeProjectId`/`activeSprintId`, read from URL/router | ⬜ |
| No tests | Folded into Phase 6 (integration + E2E) | ⬜ |

---

## Phase 6 — Production quality (next)

- [ ] CI: `dotnet build`/`test`, `npm run build`, lint
- [ ] API integration tests (`WebApplicationFactory`) — at minimum the story CRUD + validation paths
- [ ] E2E: Playwright — `/p/HIST/board`, `?story=`, DnD, browser back, login flow
- [ ] Docker Compose: api + web + db (only `db` is composed today)
- [ ] Story list pagination if >200 cards
- [ ] a11y: drawer focus trap, DnD live regions
- [ ] Telemetry: minimal request log + error reporting

---

## Suggested build order

```
2.x Backlog / planning / list      ✅
3.2 Shell polish + error boundary  ✅
3.4 Roadmap                        ✅
4.x Activity + comments + users    ✅
5   Auth                           ✅
5.5 Lobo                           ✅
5.9 Audit cleanup                  ✅
*   Audit follow-up minors         ← current
6   CI / E2E / docker / a11y       next
```

---

## Key files

| Area | Path |
|------|------|
| API entry | `api/Program.cs` |
| Story slices | `api/Features/Stories/` |
| Auth slice | `api/Features/Auth/` |
| AI / Lobo | `api/Features/Ai/Chat/` |
| Validation behavior | `api/Infrastructure/Behaviors/ValidationBehavior.cs` |
| Routes | `web/src/App.tsx` |
| Route helpers | `web/src/lib/routes.ts`, `web/src/hooks/useAppNavigate.ts` |
| Layout | `web/src/components/layout/` |
| Kanban | `web/src/components/kanban/Kanban.tsx` |
| Story drawer | `web/src/components/story/StoryDrawer.tsx` |
| Lobo panel | `web/src/components/lobo/LoboPanel.tsx` |
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
http://localhost:5175/p/HIST/board
http://localhost:5175/p/HIST/board?sprint=<uuid>&story=<uuid>
http://localhost:5175/p/HIST/backlog
http://localhost:5175/p/HIST/planning
http://localhost:5175/p/HIST/roadmap
```

Design prototype only:

```bash
cd docs/design && python3 -m http.server 8080
```

---

## Out of scope (for now)

- Multi-tenant / org billing
- Notifications, email, webhooks
- Native mobile apps
- Real-time multiplayer cursors
- Release tracking / changelog UI (Calendar surface explicitly killed — revisit via Roadmap milestone markers if it becomes needed)
