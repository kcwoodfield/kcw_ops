# kcw / ops

Personal project-management tool. Linear × Jira — built for a PM/engineer who thinks in roadmaps. Dense, dark-mode-first, keyboard-friendly.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite, TanStack Query, Zustand, @dnd-kit, Radix UI |
| Backend | .NET 10 / C# — MediatR, vertical slice architecture, CQRS |
| Database | PostgreSQL 16 (Docker) |
| Styling | CSS custom properties (dark-default design system) |

## Data model

```
Project
├── Epics     — structural categories ("what kind of work")
├── Sprints   — time-boxed iterations ("when")
└── Stories   — individual work items, optionally assigned to an epic and/or sprint
```

Stories with no sprint assignment live in the **Backlog** (first-class, not an afterthought).
Epic and Sprint are orthogonal — a story belongs to an epic for categorization and a sprint for scheduling.

## Views

| # | Surface | Status |
|---|---------|--------|
| 01 | App shell + Kanban board | ✅ |
| 02 | Sprint planning (split pane + capacity meter) | ✅ |
| 03 | Backlog table | ✅ |
| 04 | List view (grouped by Epic) | ✅ |
| 05 | Calendar / Gantt | ✅ |
| 06 | Story detail drawer | ✅ |
| 07 | Activity log + comments | ✅ |
| 08 | Sign in | ⬜ Phase 5 |

## Running locally

**Prerequisites:** Docker, .NET 10 SDK, Node 20+

```bash
# 1. Start the database
docker compose up -d

# 2. Run the API  (auto-migrates + seeds on first start)
dotnet run --project api

# 3. Run the frontend
cd web && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5175 |
| API | http://localhost:5050 |
| Postgres | localhost:5435 |

## Project structure

```
ops/
├── api/
│   ├── Controllers/          thin HTTP edge — delegates to MediatR
│   ├── Domain/               entity POCOs
│   ├── Features/             vertical slices — one folder per use case
│   │   ├── Stories/
│   │   ├── Sprints/
│   │   ├── Epics/
│   │   ├── Activity/
│   │   └── Users/
│   └── Infrastructure/Persistence/
├── web/src/
│   ├── api/                  TanStack Query hooks (per-domain files)
│   ├── components/           React components by domain
│   ├── store/                Zustand (activeProjectId, activeSprintId)
│   ├── hooks/                useAppNavigate, etc.
│   ├── lib/                  route helpers
│   └── types/                shared TS interfaces mirroring API DTOs
└── docs/
    ├── BUILD_PLAN.md          phased roadmap
    ├── CODEBASE_AUDIT.md      architecture audit (Phase 1 baseline)
    └── design/                HTML prototype — open docs/design/index.html
```

## URL structure

```
/p/:projectKey/board?sprint=<uuid>&story=<uuid>
/p/:projectKey/backlog
/p/:projectKey/planning
/p/:projectKey/list
/p/:projectKey/calendar
/p/:projectKey/activity
/login                         (Phase 5)
```

## Design reference

`docs/design/index.html` is a living prototype of all 8 surfaces with light/dark mode and accent color controls:

```bash
cd docs/design && python3 -m http.server 8080
# → http://localhost:8080
```

## Build plan

Phased roadmap: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md).

**Current phase:** 5 — Auth (`/login`, route guards, env-based API URL).
