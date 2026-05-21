# kcw / ops — web

React frontend for the kcw/ops project-management tool.

## Stack

- **React 19** + TypeScript + Vite
- **TanStack Query** — all server state; optimistic updates on Kanban DnD and story edits
- **Zustand** — UI state only (`activeProjectId`, `activeSprintId`); synced from URL in `AppShell`
- **react-router-dom v7** — URL-first routing; project + view in path, sprint + story in search params
- **@dnd-kit/core + @dnd-kit/sortable** — Kanban drag-and-drop and Sprint planning DnD
- **Radix UI Dialog** — Story drawer modal
- **CSS custom properties** — dark-default design system (`--bg`, `--fg`, `--accent`, etc.)

## Dev server

```bash
npm install
npm run dev   # → http://localhost:5175
```

Requires the API running at `http://localhost:5050` (see root README).

## Key files

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Route table |
| `src/lib/routes.ts` | URL builder helpers |
| `src/hooks/useAppNavigate.ts` | Navigation API (goToView, openStory, closeStory, etc.) |
| `src/components/layout/AppShell.tsx` | URL ↔ Zustand sync, `<Outlet />` |
| `src/store/ui.ts` | Zustand store |
| `src/api/` | TanStack Query hooks per domain |
| `src/types/index.ts` | Shared TS interfaces mirroring API DTOs |
| `src/index.css` | Design tokens (CSS custom properties) |

## Type checking

```bash
npx tsc --noEmit
```
