# Codebase Audit — kcw / ops

Date: 2026-05-22 · Branch: `lobo`
Scope: 95 API files (.NET 10 / MediatR / EF Core), 64 web files (React 19 / TS / Vite).
Findings ordered by impact. Each item is fixed in its own commit; see `git log`.

---

## 1. Critical — the frontend build is broken

`npm run build` runs `tsc -b && vite build` and fails with 15 `tsc` errors.

### 1a. Missing dependency: `class-variance-authority`

`web/src/components/ui/{badge,button,sheet}.tsx` import `cva` from
`class-variance-authority`, but the package is absent from `package.json` and
`node_modules` (`npm ls` empty, `require.resolve` → `MODULE_NOT_FOUND`). Because
these three are core Shadcn primitives used on every screen, Vite cannot resolve
them at dev time either — `npm run dev` also fails on first page load. The app
does not currently run.

Fix: `npm install class-variance-authority`.

### 1b. Type mismatch silently drops URL state — `AppShell.tsx:42`

`parseSearchParams()` returns `{ sprintId, storyId }` but `projectPath()` expects
`{ sprint, story }`. `tsc` flags it (TS2559); at runtime the `sprint`/`story`
query params are lost whenever AppShell redirects to a fallback project.

### 1c. Dead prop — `StoryDrawer.tsx:251`

Passes a `trail` prop to a component whose props are `{ title, children }`.

### 1d. Unused imports / vars (TS6133)

`LoboPanel.tsx:4` `useAuthStore`; `RoadmapView.tsx:216-217` `hasStart`/`hasEnd`;
`StoryDrawer.tsx:20-21` `AssigneeAvatar`/`Label`.

---

## 2. FluentValidation validators are registered but never run

`Program.cs:80` calls `AddValidatorsFromAssembly`, but no `IPipelineBehavior` is
registered to invoke validators. `AddValidatorsFromAssembly` only puts validators
in DI — it does not hook them into MediatR. `CreateStoryValidator` and
`UpdateStoryValidator` are dead code.

Handlers still enforce FK ownership (`epicOk`/`sprintOk` → `InvalidOperationException`,
caught by controllers), so this is not "no validation." What slips through on the
REST path:

- Non-Fibonacci `points` accepted — `CreateStoryHandler:48` / `UpdateStoryHandler:33`
  use `cmd.Points` directly with no check.
- Title / Description length unbounded — the validator's `MaximumLength(500)`
  never fires.
- Silent enum fallback — `CreateStoryHandler:40-46`: a malformed `status` yields a
  `Todo` story and HTTP 201 with no error. Same for priority, and
  `UpdateStoryHandler:27-31` (malformed status → silent no-op).

`CreateStoryValidator:10` also requires `EpicId.NotEmpty()` while the command type
is `Guid?` and the handler deliberately falls back — the dead validator already
contradicts the handler.

Fix: add a `ValidationBehavior<TReq,TResp>` pipeline behavior, register it, and map
`ValidationException` → HTTP 400.

---

## 3. The AI `ToolExecutor` bypasses CQRS and has drifted

`Features/Ai/Chat/ToolExecutor.cs` injects `AppDbContext` directly and never uses
MediatR. `CreateStoryAsync` (167) and `UpdateStoryAsync` (234) are hand-reimplemented
copies of `CreateStoryHandler` / `UpdateStoryHandler` — duplicated `maxNumber+1`,
`maxSort+1000`, epic-fallback and enum-parsing logic. The copies have diverged:

- `ToolExecutor.UpdateStoryAsync` writes no `ActivityEvent` rows;
  `UpdateStoryHandler:63-101` does. AI-driven changes are invisible in the activity log.
- `ToolExecutor.UpdateStoryAsync:257` sets `SprintId` with no project-ownership
  check; `UpdateStoryHandler:48` validates it. The AI path can move a story into
  another project's sprint.

Fix: inject `IMediator`, `Send` the existing commands.

---

## 4. `useAppView()` — DRY violation causing a real bug

`hooks/useAppNavigate.ts:10-25` re-implements view-segment matching with an inline
list that omits `'roadmap'`. On `/p/X/roadmap` the hook returns `'board'` — so the
current-view value is wrong on the roadmap surface. `lib/routes.ts` already exports
`isAppView()` + `APP_VIEWS`, a correct and complete list.

Fix: have `useAppView` call `isAppView`.

---

## 5. Dead code

| Item | Location | Notes |
|---|---|---|
| `programs.ts` (whole file) | `web/src/api/programs.ts` | `usePrograms()` never imported; imports nonexistent `ProgramDto`; calls `/api/programs` which has no controller. |
| `ViewPlaceholder` | `web/src/components/shared/ViewPlaceholder.tsx` | Zero references. |
| `View` type | `web/src/types/index.ts:138` | `@deprecated`, zero references. |
| `CreateStoryValidator`, `UpdateStoryValidator` | `api/Features/Stories/*` | Never executed — see §2. |
| Assignee branch in `CreateStoryHandler:76` | — | `story.AssigneeId` is always `null` on create; the `FindAsync` branch is unreachable. |

---

## 6. Minor / latent

- `Controllers/` vs vertical slices — CLAUDE.md prose says each slice owns its
  endpoint, but its own structure diagram lists `Controllers/`. 6 of 7 controllers
  sit in the horizontal `Controllers/` folder; only `AuthController` lives in its
  slice. Inconsistent — pick one direction and fix the doc.
- Duplicated 401-refresh logic — `client.ts` `request()` and `get()` each implement
  the refresh-on-401 dance; `get()` also drops the `{error}` body parsing.
- Latent orphan FK — `CreateStoryHandler:58` sets `EpicId = resolvedEpicId ?? Guid.Empty`
  when a project has no epics; `Story.EpicId` is a non-nullable FK and `StoryMapper`
  dereferences `s.Epic.Title`. Masked only because the seeder always creates a "General" epic.
- Redundant routing state — `store/ui.ts` mirrors `activeProjectId`/`activeSprintId`
  from the URL via `AppShell` effects; 13 components read the store instead of the
  router, creating a second source of truth synced by `useEffect`.
- Redundant reload — `UpdateStoryHandler:107` reloads the `Project` navigation after
  save though `Project` never changes and was already `Include`d.
- No tests — no test project, no `.test.ts`/`.spec.ts`. For a CQRS codebase the
  handlers are the units worth covering.
