import { useState } from 'react'
import { ChevronRight, Inbox, Eye, Star, GitBranch, CalendarDays, Map, Zap, Settings, Sun, Moon } from 'lucide-react'
import { useProjects } from '../../api/projects'
import { useUiStore } from '../../store/ui'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { Shield } from '../Shield'
import { CreateProjectModal } from '../CreateProjectModal'
import type { ProjectDto } from '../../types'

export function Sidebar() {
  const { data: projects = [] } = useProjects()
  const { activeProjectId, sidebarCollapsed } = useUiStore()
  const { goToProject, goToView } = useAppNavigate()
  const [projectModalOpen, setProjectModalOpen] = useState(false)

  return (
    <aside style={{
      gridRow: '1 / span 3',
      background: 'var(--panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      width: sidebarCollapsed ? 52 : 232,
      minWidth: 0,
      overflow: 'hidden',
      transition: 'width 0.18s ease',
    }}>
      <WorkspaceHeader />

      {!sidebarCollapsed && (
        <>
          <nav style={{ padding: '8px 6px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <NavRow icon={<Inbox size={14} />} label="Inbox" trail="3" onClick={() => goToView('backlog')} />
            <NavRow icon={<Eye size={14} />} label="My issues" trail="14" />
            <NavRow icon={<Star size={14} />} label="Starred" />
            <NavRow icon={<GitBranch size={14} />} label="Drafts" />
          </nav>

          <SectionHeader label="Projects" action={<PlusIcon onClick={() => setProjectModalOpen(true)} />} />

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 12px' }}>
            {projects.map(p => (
              <ProjectRow
                key={p.id}
                project={p}
                active={p.id === activeProjectId}
                onClick={() => goToProject(p.key, 'board')}
              />
            ))}

            <SectionHeader label="Views" style={{ padding: '20px 8px 6px 8px' }} />
            <NavRow icon={<Zap size={14} />} label="Sprint planning" onClick={() => goToView('planning')} />
            <NavRow icon={<Map size={14} />} label="Roadmap" />
            <NavRow icon={<CalendarDays size={14} />} label="Releases" onClick={() => goToView('calendar')} />
          </div>

          <UserFooter />
        </>
      )}

      <CreateProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
    </aside>
  )
}

function WorkspaceHeader() {
  const { theme, sidebarCollapsed, toggleSidebar } = useUiStore()
  return (
    <div style={{
      height: 80,
      padding: sidebarCollapsed ? '0' : '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: sidebarCollapsed ? 'center' : undefined,
      gap: 10,
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <button
        type="button"
        onClick={sidebarCollapsed ? toggleSidebar : undefined}
        style={{ display: 'flex', padding: 0, cursor: sidebarCollapsed ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <Shield size={28} variant={theme === 'dark' ? 'dark' : 'light'} />
      </button>
      {!sidebarCollapsed && (
        <>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24, fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}>Ops</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>workspace</div>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, flexShrink: 0 }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            <ChevronRight size={12} />
          </button>
        </>
      )}
    </div>
  )
}

function NavRow({ icon, label, trail, active, onClick }: {
  icon: React.ReactNode
  label: string
  trail?: string
  active?: boolean
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 8px', borderRadius: 4,
        width: '100%', textAlign: 'left',
        fontSize: 12.5,
        color: active ? 'var(--fg)' : 'var(--fg-1)',
        fontWeight: active ? 500 : 400,
        background: active ? 'var(--active)' : hovered ? 'var(--hover)' : 'transparent',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}>
      <span style={{ color: 'var(--fg-3)', display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {trail && <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{trail}</span>}
    </button>
  )
}

function SectionHeader({ label, action, style }: {
  label: string
  action?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div style={{
      padding: '12px 14px 4px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      ...style,
    }}>
      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      {action}
    </div>
  )
}

function ProjectRow({ project, active, onClick }: { project: ProjectDto; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 8px', borderRadius: 4, marginBottom: 1,
        background: active ? 'var(--active)' : hovered ? 'var(--hover)' : 'transparent',
        color: active ? 'var(--fg)' : 'var(--fg-1)',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: project.color, flexShrink: 0 }} />
      <span style={{ flex: 1, textAlign: 'left', fontSize: 12.5 }}>{project.name}</span>
      <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{project.key}</span>
    </button>
  )
}

function UserFooter() {
  const { theme, toggleTheme } = useUiStore()
  return (
    <div style={{
      padding: '8px 10px',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 8,
      flexShrink: 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: 'var(--accent-bg)',
        border: '1px solid var(--accent-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600,
        color: 'var(--accent-fg)', textTransform: 'uppercase',
      }}>me</div>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg)' }}>You</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>staff PM</div>
      </div>
      <button
        type="button"
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        onClick={toggleTheme}
        style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, display: 'flex' }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
        {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
      </button>
      <button
        type="button"
        style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, display: 'flex' }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
        <Settings size={13} />
      </button>
    </div>
  )
}

function PlusIcon({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ color: 'var(--fg-3)', padding: 2, borderRadius: 3 }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}
