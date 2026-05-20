import { useState } from 'react'
import { ChevronRight, Folder, Inbox, Eye, Star, GitBranch, CalendarDays, Map, Zap, Settings } from 'lucide-react'
import { usePrograms } from '../../api/programs'
import { useUiStore } from '../../store/ui'
import type { ProgramDto, ProjectDto } from '../../types'

export function Sidebar() {
  const { data: programs = [] } = usePrograms()
  const { activeProjectId, setActiveProject } = useUiStore()

  return (
    <aside style={{
      gridRow: '1 / span 2',
      background: 'var(--panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      width: 232,
      minWidth: 0,
      overflow: 'hidden',
    }}>
      <WorkspaceHeader />

      <nav style={{ padding: '8px 6px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <NavRow icon={<Inbox size={14} />} label="Inbox" trail="3" />
        <NavRow icon={<Eye size={14} />} label="My issues" trail="14" />
        <NavRow icon={<Star size={14} />} label="Starred" />
        <NavRow icon={<GitBranch size={14} />} label="Drafts" />
      </nav>

      <SectionHeader label="Programs" action={<PlusIcon />} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 12px' }}>
        {programs.map((pg, i) => (
          <ProgramNode
            key={pg.id}
            program={pg}
            defaultOpen={i === 0}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProject}
          />
        ))}

        <SectionHeader label="Views" style={{ padding: '20px 8px 6px 8px' }} />
        <NavRow icon={<Zap size={14} />} label="Sprint planning" />
        <NavRow icon={<Map size={14} />} label="Roadmap" />
        <NavRow icon={<CalendarDays size={14} />} label="Releases" />
      </div>

      <UserFooter />
    </aside>
  )
}

function WorkspaceHeader() {
  return (
    <div style={{
      height: 40,
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <div style={{
        width: 22, height: 22,
        borderRadius: 5,
        background: 'linear-gradient(135deg, var(--accent), oklch(0.55 0.14 20))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        color: 'var(--accent-ink)', letterSpacing: '-0.02em',
        flexShrink: 0,
      }}>k</div>
      <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg)' }}>kcw / ops</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>personal workspace</div>
      </div>
      <button style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, flexShrink: 0 }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
        <ChevronRight size={12} />
      </button>
    </div>
  )
}

function NavRow({ icon, label, trail, active }: {
  icon: React.ReactNode
  label: string
  trail?: string
  active?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
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

function SectionHeader({ label, action, style }: { label: string; action?: React.ReactNode; style?: React.CSSProperties }) {
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

function ProgramNode({ program, defaultOpen, activeProjectId, onSelectProject }: {
  program: ProgramDto
  defaultOpen: boolean
  activeProjectId: string | null
  onSelectProject: (id: string) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 6px', borderRadius: 4,
          fontSize: 12.5, fontWeight: 500, color: 'var(--fg-1)',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
        <span style={{
          display: 'inline-flex', width: 12,
          transform: open ? 'rotate(90deg)' : 'none',
          transition: 'transform .12s',
          color: 'var(--fg-3)',
        }}>
          <ChevronRight size={11} />
        </span>
        <Folder size={13} style={{ color: 'var(--fg-3)' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{program.name}</span>
      </button>

      {open && (
        <div style={{ marginLeft: 18, borderLeft: '1px solid var(--border)', paddingLeft: 8, marginTop: 2 }}>
          {program.projects.map(pr => (
            <ProjectRow
              key={pr.id}
              project={pr}
              active={pr.id === activeProjectId}
              onClick={() => onSelectProject(pr.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProjectRow({ project, active, onClick }: { project: ProjectDto; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
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
      <button style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3 }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
        onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
        <Settings size={13} />
      </button>
    </div>
  )
}

function PlusIcon() {
  return (
    <button style={{ color: 'var(--fg-3)', padding: 2, borderRadius: 3 }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}
