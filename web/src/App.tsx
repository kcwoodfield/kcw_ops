import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { WorkspaceShell } from './components/layout/WorkspaceShell'
import { Backlog } from './components/backlog/Backlog'
import { ActivityLog } from './components/activity/ActivityLog'
import { CalendarView } from './components/calendar/CalendarView'
import { CommandPalette } from './components/CommandPalette'
import { Kanban } from './components/kanban/Kanban'
import { SprintPlanning } from './components/planning/SprintPlanning'
import { ListView } from './components/list/ListView'
import { StoryDrawer } from './components/story/StoryDrawer'
import { RoadmapView } from './components/roadmap/RoadmapView'
import { InboxView } from './components/workspace/InboxView'
import { MyIssuesView } from './components/workspace/MyIssuesView'
import { StarredView } from './components/workspace/StarredView'
import { DraftsView } from './components/workspace/DraftsView'
import { LAST_PROJECT_KEY } from './lib/routes'

function RootRedirect() {
  const last = localStorage.getItem(LAST_PROJECT_KEY) ?? 'AUTH'
  return <Navigate to={`/p/${last}/board`} replace />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/inbox" element={<WorkspaceShell title="Inbox" />}>
          <Route index element={<InboxView />} />
        </Route>
        <Route path="/my-issues" element={<WorkspaceShell title="My Issues" />}>
          <Route index element={<MyIssuesView />} />
        </Route>
        <Route path="/starred" element={<WorkspaceShell title="Starred" />}>
          <Route index element={<StarredView />} />
        </Route>
        <Route path="/drafts" element={<WorkspaceShell title="Drafts" />}>
          <Route index element={<DraftsView />} />
        </Route>
        <Route path="/p/:projectKey" element={<AppShell />}>
          <Route index element={<Navigate to="board" replace />} />
          <Route path="board" element={<Kanban />} />
          <Route path="backlog" element={<Backlog />} />
          <Route path="planning" element={<SprintPlanning />} />
          <Route path="list" element={<ListView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="roadmap" element={<RoadmapView />} />
          <Route path="activity" element={<ActivityLog />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
      <StoryDrawer />
      <CommandPalette />
    </>
  )
}
