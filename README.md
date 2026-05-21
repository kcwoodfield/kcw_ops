# kcw / ops

Personal project-management tool. Linear × Jira — built for a PM/engineer who thinks in roadmaps. Dense, dark-mode-first, keyboard-friendly.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Shadcn UI (Radix + Tailwind) |
| Backend | .NET 10 / C# — MediatR, vertical slice architecture, CQRS |
| Database | PostgreSQL 16 (Docker) |
| State | TanStack Query (server) + Zustand (UI) |

## Data model

```
Project → Epic → Sprint → Story
```

Stories not assigned to a sprint live in the **Backlog** (first-class, not an afterthought).

## Views

| # | Surface |
|---|---------|
| 01 | App shell + Kanban board |
| 02 | Sprint planning (split pane + capacity meter) |
| 03 | Backlog table |
| 04 | List view (grouped by Epic) |
| 05 | Calendar / Gantt |
| 06 | Story detail drawer |
| 07 | Activity log |
| 08 | Sign in |

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
├── api/              .NET backend
│   ├── Controllers/
│   ├── Domain/
│   ├── Features/     vertical slices (Commands + Queries)
│   └── Infrastructure/
├── web/              React frontend
│   └── src/
│       ├── api/      TanStack Query hooks
│       ├── components/
│       ├── store/    Zustand
│       └── types/
└── docs/
    ├── BUILD_PLAN.md  phased roadmap
    └── design/        HTML prototype — open docs/design/index.html
```

## Build plan

Phased roadmap from the current read-only Kanban to full app: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md).

## Design reference

The `docs/design/index.html` file is a living prototype of all 8 surfaces. Open it with a local server to see the full design canvas with light/dark mode and accent color controls:

```bash
cd docs/design && python3 -m http.server 8080
# → http://localhost:8080
```
