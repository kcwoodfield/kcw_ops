import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { usePrograms } from '../../api/programs'
import { useSprints } from '../../api/stories'
import { useUiStore } from '../../store/ui'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: programs = [] } = usePrograms()
  const { activeProjectId, activeSprintId, setActiveProject, setActiveSprint } = useUiStore()
  const { data: sprints = [] } = useSprints(activeProjectId ?? '')

  // Auto-select AUTH (seed data) or first project on load
  useEffect(() => {
    if (!activeProjectId && programs.length > 0) {
      const projects = programs.flatMap(p => p.projects)
      const auth = projects.find(p => p.key === 'AUTH') ?? projects[0]
      if (auth) setActiveProject(auth.id)
    }
  }, [programs, activeProjectId, setActiveProject])

  // Auto-select active sprint when project changes
  useEffect(() => {
    if (!activeProjectId || sprints.length === 0) return
    if (activeSprintId && sprints.some(s => s.id === activeSprintId)) return
    const next = sprints.find(s => s.state === 'active') ?? sprints[sprints.length - 1]
    if (next) setActiveSprint(next.id)
  }, [activeProjectId, activeSprintId, sprints, setActiveSprint])

  const activeProject = programs
    .flatMap(p => p.projects)
    .find(p => p.id === activeProjectId)

  const breadcrumb = activeProject
    ? [programs.find(pg => pg.projects.some(p => p.id === activeProjectId))?.name ?? '', activeProject.name].filter(Boolean)
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
        {children}
      </main>
    </div>
  )
}
