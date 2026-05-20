import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { usePrograms } from '../../api/programs'
import { useSprints } from '../../api/stories'
import type { AppView } from '../../lib/routes'
import { isAppView, LAST_PROJECT_KEY, parseSearchParams, projectPath } from '../../lib/routes'
import { useUiStore } from '../../store/ui'

export function AppShell() {
  const { projectKey } = useParams()
  const { pathname } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: programs = [] } = usePrograms()
  const { activeProjectId, activeSprintId, setActiveProject, setActiveSprint } = useUiStore()
  const { data: sprints = [] } = useSprints(activeProjectId ?? '')

  const projects = programs.flatMap(p => p.projects)
  const project = projects.find(p => p.key === projectKey?.toUpperCase())

  // Resolve projectKey → activeProjectId
  useEffect(() => {
    if (!programs.length) return

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
  }, [programs, project, projectKey, activeProjectId, setActiveProject, navigate, searchParams, projects, pathname])

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

  const program = programs.find(pg => pg.projects.some(p => p.id === activeProjectId))
  const breadcrumb = project
    ? [program?.name ?? '', project.name].filter(Boolean)
    : ['kcw / ops']

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: '232px 1fr',
      gridTemplateRows: '40px 1fr',
      background: 'var(--bg)',
      color: 'var(--fg)',
      overflow: 'hidden',
    }}>
      <Sidebar />
      <TopBar breadcrumb={breadcrumb} />
      <main style={{
        background: 'var(--bg)',
        overflow: 'hidden',
        position: 'relative',
        borderTop: '1px solid var(--border)',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
