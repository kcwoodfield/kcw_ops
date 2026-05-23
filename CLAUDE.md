# kcw / ops — CLAUDE.md

Personal project-management tool. Think Linear × Jira, built for a PM/engineer who thinks in roadmaps. Dense, dark-mode-first, keyboard-friendly.

---

## Stack

### Backend — .NET / C#
- **MediatR** for CQRS dispatch
- **Vertical slice architecture** — each slice under `api/Features/{Entity}/{UseCase}/` owns its Command or Query, Handler, and Validator (one folder per use case, not horizontal `Services/ + Repositories/` layers)
- **HTTP layer:** thin entity-level controllers in `api/Controllers/` dispatch to MediatR. They hold no business logic — routing only. `AuthController` lives inside its slice (`Features/Auth/`) because it co-orchestrates Login → Verify with cookie/temp-token state that's HTTP-shaped, not entity-shaped.
- **CQRS** — Commands mutate; Queries read; never mix in a single handler
- **Validation** — FluentValidation validators in each slice run via a MediatR `ValidationBehavior` pipeline; `ValidationException` → 400 ProblemDetails
- **AI writes** — `ToolExecutor` sends MediatR commands so REST and AI paths share one implementation

### Database
- **PostgreSQL** in a local Docker container named `kcw_ops`
- All DB access goes through the API — frontend never touches Postgres directly

### Frontend — React / TypeScript
- **Shadcn UI** (Radix primitives + Tailwind) — use Shadcn components first, don't reinvent
- Replace design prototype's inline SVG icons with **lucide-react**
- State: **TanStack Query** for server data; **react-router-dom** for URLs (project, view, story drawer); **Zustand** for ephemeral UI (cmd palette, drag state)
- Story drawer is a Shadcn `Sheet` (`side="right"`, 720–920px wide)

---

## Data model

```
Project → Epic → Sprint → Story
```

- **Backlog** = stories with no sprint assignment (first-class, not an afterthought)
- Story ID format: `{PROJECT_KEY}-{monotonic_int}` e.g. `AUTH-247`
- Story points: Fibonacci only — 1 2 3 5 8 13 21
- Status: `todo` · `progress` · `review` · `done` + `blocked` flag
- Priority: 0 Urgent · 1 High · 2 Med · 3 Low

---

## Project structure

```
kcw_ops/
├── api/              .NET backend
│   ├── Controllers/  thin per-entity HTTP dispatchers → MediatR
│   ├── Domain/
│   ├── Features/     vertical slices — one folder per use case (+ Auth's controller co-located)
│   └── Infrastructure/
│       ├── Behaviors/      MediatR pipeline behaviors (ValidationBehavior)
│       ├── Persistence/    AppDbContext + EF migrations + DataSeeder
│       └── ValidationExceptionHandler.cs
├── web/              React frontend
│   └── src/
│       ├── api/      TanStack Query hooks (client.ts + per-domain files)
│       ├── components/layout/   AppShell, Sidebar, TopBar
│       ├── store/    Zustand (ui.ts — ephemeral UI; URL mirror for project/sprint)
│       └── types/    shared TS interfaces mirroring API DTOs
└── docs/
    ├── AUDIT.md       findings from the 2026-05-22 cleanup pass
    ├── AUTH_PLAN.md   JWT + TOTP design
    ├── BUILD_PLAN.md  phased roadmap (what to build next)
    ├── LOBO_PRD.md    AI assistant design
    └── design/        HTML prototype (open with python3 -m http.server)
```

## Build plan

See [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) for phased delivery: surface checklist, **client routing** (`/p/:projectKey/board?story=`), API slices, and build order. Update it when a phase ships.

## Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5175 |
| .NET API | 5050 |
| Postgres (Docker) | 5435 |

## Design reference

`docs/design/index.html` — living prototype of all 8 surfaces. Run with:

```bash
cd docs/design && python3 -m http.server 8080
```

Design surfaces:
| # | Surface | Component |
|---|---------|-----------|
| 01 | App shell + Kanban | `AppShell` + `Kanban` |
| 02 | Sprint planning | `SprintPlanning` |
| 03 | Backlog table | `Backlog` |
| 04 | List (grouped by Epic) | `ListView` |
| —  | Roadmap (epic timeline) | `RoadmapView` |
| 06 | Story detail drawer | `StoryDrawer` |
| 07 | Activity log | `ActivityLog` |
| 08 | Sign in | `LoginPage` |

Surface 05 (Calendar / Gantt) was removed as redundant with Roadmap — see `docs/AUDIT.md`.

---

## Public repo rules

This repo is **public**. Never commit:
- Real names, email addresses, or employer details
- Company-specific context or stakeholder info
- Any file that identifies the user beyond the `kcw` handle

Fictional names in design mock data (J. Tanaka, M. Reyes, etc.) are fine — they are design placeholders, not real people.
