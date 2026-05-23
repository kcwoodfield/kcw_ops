import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ActionBar } from './ActionBar'
import { ErrorBoundary } from '../shared/ErrorBoundary'
import { useProjects } from '../../api/projects'
import { useSprints } from '../../api/stories'
import type { AppView } from '../../lib/routes'
import { isAppView, LAST_PROJECT_KEY, parseSearchParams, projectPath } from '../../lib/routes'
import { useUiStore } from '../../store/ui'
import { useIsCompact } from '../../hooks/useMediaQuery'
import { useActiveProjectId } from '../../hooks/useAppNavigate'
import { LoboPanel } from '../lobo/LoboPanel'
import { Footer } from './Footer'

export function AppShell() {
  const { projectKey } = useParams()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: projects = [] } = useProjects()
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore()
  const activeProjectId = useActiveProjectId()
  const { data: sprints = [] } = useSprints(activeProjectId ?? '')
  const compact = useIsCompact()

  const project = projects.find(p => p.key === projectKey?.toUpperCase())

  // Extract primitives so the effect dep array is value-stable.
  // URLSearchParams is a new object reference every render; using its primitive
  // extracts avoids the effect firing (and potentially calling navigate) on
  // every render — which was the source of the infinite update loop.
  const { sprintId: sprintIdInUrl, storyId: storyIdInUrl } = parseSearchParams(searchParams)
  const sprintInUrl = sprintIdInUrl

  // Persist last project · redirect to fallback when the URL key doesn't match.
  useEffect(() => {
    if (!projects.length) return

    if (project) {
      localStorage.setItem(LAST_PROJECT_KEY, project.key)
      return
    }

    const fallback = projects.find(p => p.key === 'AUTH') ?? projects[0]
    if (fallback) {
      const match = pathname.match(/\/p\/[^/]+\/([^/?]+)/)
      const segment: AppView = isAppView(match?.[1]) ? match![1] : 'board'
      navigate(projectPath(fallback.key, segment, { sprint: sprintIdInUrl, story: storyIdInUrl }), { replace: true })
    }
  }, [projects, project, projectKey, navigate, sprintIdInUrl, storyIdInUrl, pathname])

  // Default the active sprint into the URL when missing.
  useEffect(() => {
    if (!activeProjectId || sprints.length === 0) return
    if (sprintInUrl) return

    const next = sprints.find(s => s.state === 'active') ?? sprints[sprints.length - 1]
    if (!next) return

    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      p.set('sprint', next.id)
      return p
    }, { replace: true })
  }, [activeProjectId, sprints, sprintInUrl, setSearchParams])

  const breadcrumb = project ? [project.name] : ['kcw / ops']

  // Close the slide-over on navigation and when leaving compact width.
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname, setMobileSidebarOpen])

  useEffect(() => {
    if (!compact) setMobileSidebarOpen(false)
  }, [compact, setMobileSidebarOpen])

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: compact ? '1fr' : sidebarCollapsed ? '52px 1fr' : '232px 1fr',
      gridTemplateRows: '44px 44px 1fr',
      background: 'var(--bg)',
      color: 'var(--fg)',
      overflow: 'hidden',
    }}>
      <Sidebar compact={compact} />
      <TopBar />
      <ActionBar breadcrumb={breadcrumb} />
      <main style={{
        background: 'var(--bg)',
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: 52,
      }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      <Footer />

      {compact && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 19,
          }}
        />
      )}
      <LoboPanel />
    </div>
  )
}
