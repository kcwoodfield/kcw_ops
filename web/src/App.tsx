import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { WorkspaceShell } from './components/layout/WorkspaceShell'
import { Backlog } from './components/backlog/Backlog'
import { ActivityLog } from './components/activity/ActivityLog'
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
import { LoginPage } from './components/auth/LoginPage'
import { AuthFadeContext } from './context/auth-fade'
import { FadeTransition, useFade } from './lib/fade-transitions'
import { useAuthStore } from './store/auth'
import { LAST_PROJECT_KEY } from './lib/routes'

function RootRedirect() {
  const last = localStorage.getItem(LAST_PROJECT_KEY) ?? 'AUTH'
  return <Navigate to={`/p/${last}/board`} replace />
}

function ProtectedRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<RootRedirect />} />
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

export default function App() {
  const { ready, authed, logout } = useAuthStore()
  const fade = useFade({ initialVisible: false })
  const animatingRef = useRef(fade.animating)
  animatingRef.current = fade.animating

  useEffect(() => {
    if (ready) void fade.fadeIn()
  }, [ready, fade.fadeIn])

  useEffect(() => {
    const handler = () => {
      if (animatingRef.current) return
      void fade.crossFade(() => void logout())
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [fade.crossFade, logout])

  if (!ready) return null

  return (
    <AuthFadeContext.Provider value={{ crossFade: fade.crossFade }}>
      <FadeTransition show={fade.visible}>
        {authed ? <ProtectedRoutes /> : <LoginPage />}
      </FadeTransition>
    </AuthFadeContext.Provider>
  )
}
