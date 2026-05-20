# kcw / ops — CLAUDE.md

Personal project-management tool. Think Linear × Jira, built for a PM/engineer who thinks in roadmaps. Dense, dark-mode-first, keyboard-friendly.

---

## Stack

### Backend — .NET / C#
- **MediatR** for CQRS dispatch
- **Vertical slice architecture** — features are self-contained folders, not horizontal layers
  - Each slice owns its Command or Query, Handler, validator, and endpoint
  - `Features/Stories/CreateStory/` not `Controllers/ + Services/ + Repositories/`
- **CQRS** — Commands mutate; Queries read; never mix in a single handler

### Database
- **PostgreSQL** in a local Docker container named `kcw_operations`
- All DB access goes through the API — frontend never touches Postgres directly

### Frontend — React / TypeScript
- **Shadcn UI** (Radix primitives + Tailwind) — use Shadcn components first, don't reinvent
- Replace design prototype's inline SVG icons with **lucide-react**
- State: **TanStack Query** for server data; **Zustand** or **Jotai** for UI state
- Story drawer is a Shadcn `Sheet` (`side="right"`, 720–920px wide)

---

## Data model

```
Program ─┬─ Project ─┬─ Epic ─┬─ Sprint ─┬─ Story / Task
```

- **Backlog** = stories with no sprint assignment (first-class, not an afterthought)
- Story ID format: `{PROJECT_KEY}-{monotonic_int}` e.g. `AUTH-247`
- Story points: Fibonacci only — 1 2 3 5 8 13 21
- Status: `todo` · `progress` · `review` · `done` + `blocked` flag
- Priority: 0 Urgent · 1 High · 2 Med · 3 Low

---

## Design reference

The `index.html` at repo root is the living design prototype (React + Babel, no build step). Open with a local server:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

All tokens, colors, spacing, and component specs are in `tokens.css` and the design handoff README (see below).

Design surfaces:
| # | Surface | Component |
|---|---------|-----------|
| 01 | App shell + Kanban | `AppShell` + `Kanban` |
| 02 | Sprint planning | `SprintPlanning` |
| 03 | Backlog table | `Backlog` |
| 04 | List (grouped by Epic) | `ListView` |
| 05 | Calendar / Gantt | `CalendarView` |
| 06 | Story detail drawer | `StoryDetail` |
| 07 | Activity log | `ActivityLog` |
| 08 | Sign in | `LoginPage` |

---

## Public repo rules

This repo is **public**. Never commit:
- Real names, email addresses, or employer details
- Company-specific context or stakeholder info
- Any file that identifies the user beyond the `kcw` handle

Fictional names in design mock data (J. Tanaka, M. Reyes, etc.) are fine — they are design placeholders, not real people.
