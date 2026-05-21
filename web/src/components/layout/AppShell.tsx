import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ActionBar } from './ActionBar'
import { useProjects } from '../../api/projects'
import { useSprints } from '../../api/stories'
import type { AppView } from '../../lib/routes'
import { isAppView, LAST_PROJECT_KEY, parseSearchParams, projectPath } from '../../lib/routes'
import { useUiStore } from '../../store/ui'

export function AppShell() {
  const { projectKey } = useParams()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: projects = [] } = useProjects()
  const { activeProjectId, activeSprintId, setActiveProject, setActiveSprint, sidebarCollapsed } = useUiStore()
  const { data: sprints = [] } = useSprints(activeProjectId ?? '')

  const project = projects.find(p => p.key === projectKey?.toUpperCase())

  // Resolve projectKey → activeProjectId
  useEffect(() => {
    if (!projects.length) return

    if (project) {
      if (activeProjectId !== project.id) setActiveProject(project.id)
      localStorage.setItem(LAST_PROJECT_KEY, project.key)
      return
    }

    const fallback = projects.find(p => p.key === 'AUTH') ?? projects[0]
    if (fallback) {
      const match = pathname.match(/\/p\/[^/]+\/([^/?]+)/)
      const segment: AppView = isAppView(match?.[1]) ? match![1] : 'board'
      navigate(projectPath(fallback.key, segment, parseSearchParams(searchParams)), { replace: true })
    }
  }, [projects, project, projectKey, activeProjectId, setActiveProject, navigate, searchParams, pathname])

  // Sync sprint search param → store
  useEffect(() => {
    const sprintFromUrl = searchParams.get('sprint')
    if (sprintFromUrl && sprintFromUrl !== activeSprintId) {
      setActiveSprint(sprintFromUrl)
    }
  }, [searchParams, activeSprintId, setActiveSprint])

  // Default sprint into URL when missing
  useEffect(() => {
    if (!activeProjectId || sprints.length === 0) return
    if (searchParams.get('sprint')) return

    const next = sprints.find(s => s.state === 'active') ?? sprints[sprints.length - 1]
    if (!next) return

    setActiveSprint(next.id)
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      p.set('sprint', next.id)
      return p
    }, { replace: true })
  }, [activeProjectId, sprints, searchParams, setActiveSprint, setSearchParams])

  const breadcrumb = project ? [project.name] : ['kcw / ops']

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: sidebarCollapsed ? '52px 1fr' : '232px 1fr',
      gridTemplateRows: '80px 44px 1fr',
      background: 'var(--bg)',
      color: 'var(--fg)',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <TopBar breadcrumb={breadcrumb} />
      <ActionBar />
      <main style={{
        background: 'var(--bg)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
