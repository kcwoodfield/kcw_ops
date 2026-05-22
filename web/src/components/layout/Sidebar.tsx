import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, Inbox, Eye, Star, GitBranch, CalendarDays, Map, Zap, Pencil, Trash2, X, Plus, UserCircle, Moon, Sun } from 'lucide-react'
import { useDeleteProject, useProjects } from '../../api/projects'
import { useInboxStories, useMyIssues, useStarredStories, useDraftStories, useCreateStory } from '../../api/stories'
import { useUiStore } from '../../store/ui'
import { useAuthStore } from '../../store/auth'
import { useAuthFade } from '../../context/auth-fade'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { projectPath } from '../../lib/routes'
import type { AppView } from '../../lib/routes'
import { Shield } from '../Shield'
import { CreateProjectModal } from '../CreateProjectModal'
import { ConfirmModal } from '../shared/ConfirmModal'
import type { ProjectDto } from '../../types'

export function Sidebar({ compact = false }: { compact?: boolean }) {
  const { data: projects = [] } = useProjects()
  const { activeProjectId, sidebarCollapsed, mobileSidebarOpen } = useUiStore()
  const { goToProject } = useAppNavigate()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectDto | undefined>()

  const { data: inbox = [] } = useInboxStories()
  const { data: myIssues = [] } = useMyIssues()
  const { data: starred = [] } = useStarredStories()
  const { data: drafts = [] } = useDraftStories()

  const openCreate = () => { setEditingProject(undefined); setProjectModalOpen(true) }
  const openEdit = (p: ProjectDto) => { setEditingProject(p); setProjectModalOpen(true) }

  // In compact mode the sidebar is always full width — the collapse toggle
  // only applies to the desktop docked sidebar.
  const collapsed = compact ? false : sidebarCollapsed

  return (
    <aside style={{
      ...(compact
        ? {
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 232, zIndex: 20,
            transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
            boxShadow: mobileSidebarOpen ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
          }
        : {
            gridRow: '1 / span 3',
            width: collapsed ? 52 : 232,
            transition: 'width 0.18s ease',
          }),
      background: 'var(--panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      overflow: 'hidden',
    }}>
      <WorkspaceHeader collapsed={collapsed} compact={compact} />

      {!collapsed && (
        <>
          <nav style={{ padding: '8px 6px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <NavRow icon={<Inbox size={14} />} label="Inbox" trail={inbox.length > 0 ? String(inbox.length) : undefined} active={pathname === '/inbox'} onClick={() => navigate('/inbox')} />
            <NavRow icon={<Eye size={14} />} label="My issues" trail={myIssues.length > 0 ? String(myIssues.length) : undefined} active={pathname === '/my-issues'} onClick={() => navigate('/my-issues')} />
            <NavRow icon={<Star size={14} />} label="Starred" trail={starred.length > 0 ? String(starred.length) : undefined} active={pathname === '/starred'} onClick={() => navigate('/starred')} />
            <NavRow icon={<GitBranch size={14} />} label="Drafts" trail={drafts.length > 0 ? String(drafts.length) : undefined} active={pathname === '/drafts'} onClick={() => navigate('/drafts')} />
          </nav>

          <SectionHeader label="Projects" action={<PlusIcon onClick={openCreate} />} />

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 12px' }}>
            {projects.map(p => (
              <ProjectRow
                key={p.id}
                project={p}
                active={p.id === activeProjectId}
                currentPath={pathname}
                onClick={() => goToProject(p.key, 'board')}
                onEdit={() => openEdit(p)}
              />
            ))}
          </div>

        </>
      )}

      <CreateProjectModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        project={editingProject}
      />

      <SidebarFooter collapsed={collapsed} />
    </aside>
  )
}

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const { theme, toggleTheme } = useUiStore()
  const { logout } = useAuthStore()
  const { crossFade } = useAuthFade()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
      padding: collapsed ? '8px 0' : '8px 10px',
      flexShrink: 0,
      display: 'flex',
      justifyContent: collapsed ? 'center' : undefined,
    }}>
      <div ref={ref} style={{ position: 'relative', width: collapsed ? 'auto' : '100%' }}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          title="Profile"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 34,
            padding: collapsed ? '0 10px' : '0 14px',
            width: collapsed ? 'auto' : '100%',
            background: open ? 'var(--hover)' : 'transparent',
            border: '1px solid transparent',
            borderRadius: 8,
            fontSize: 15, fontWeight: 500,
            color: 'var(--fg-2)',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--hover)'
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseOut={e => {
            if (!open) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'transparent'
            }
            e.currentTarget.style.color = open ? 'var(--fg)' : 'var(--fg-2)'
          }}
        >
          <UserCircle size={16} />
          {!collapsed && 'Profile'}
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '4px 0',
            minWidth: 180,
            zIndex: 200,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
          }}>
            <button
              type="button"
              onClick={() => { toggleTheme(); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 14.5, color: 'var(--fg-1)',
                background: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button
              type="button"
              onClick={() => { setOpen(false); void crossFade(() => void logout()) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 14.5, color: 'var(--fg-danger, #f87171)',
                background: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function WorkspaceHeader({ collapsed, compact }: { collapsed: boolean; compact: boolean }) {
  const { theme, toggleSidebar, setMobileSidebarOpen } = useUiStore()
  return (
    <div style={{
      height: 80,
      padding: collapsed ? '0' : '0 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : undefined,
      gap: 10,
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <button
        type="button"
        onClick={collapsed ? toggleSidebar : undefined}
        style={{ display: 'flex', padding: 0, cursor: collapsed ? 'pointer' : 'default', flexShrink: 0 }}
      >
        <Shield size={28} variant={theme === 'dark' ? 'dark' : 'light'} />
      </button>
      {!collapsed && (
        <>
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26, fontWeight: 600,
              color: 'var(--fg)',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}>Ops</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>workspace</div>
          </div>
          <button
            type="button"
            onClick={compact ? () => setMobileSidebarOpen(false) : toggleSidebar}
            title={compact ? 'Close menu' : 'Collapse sidebar'}
            style={{ color: 'var(--fg-3)', padding: 4, borderRadius: 3, flexShrink: 0 }}
            onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
            {compact ? <X size={14} /> : <ChevronRight size={12} />}
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
        fontSize: 14.5,
        color: active ? 'var(--fg)' : 'var(--fg-1)',
        fontWeight: active ? 500 : 400,
        background: active ? 'var(--active)' : hovered ? 'var(--hover)' : 'transparent',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}>
      <span style={{ color: 'var(--fg-3)', display: 'flex' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {trail && <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{trail}</span>}
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
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      {action}
    </div>
  )
}

const PROJECT_SUB_VIEWS: { view: AppView; label: string; icon: React.ReactNode }[] = [
  { view: 'planning',  label: 'Sprint planning', icon: <Zap size={12} /> },
  { view: 'roadmap',   label: 'Roadmap',         icon: <Map size={12} /> },
  { view: 'calendar',  label: 'Releases',        icon: <CalendarDays size={12} /> },
]

function ProjectRow({ project, active, currentPath, onClick, onEdit }: {
  project: ProjectDto; active: boolean; currentPath: string; onClick: () => void; onEdit: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const deleteProject = useDeleteProject()
  const createStory = useCreateStory()
  const { openStory } = useAppNavigate()
  const navigate = useNavigate()

  const handleCreateTask = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const story = await createStory.mutateAsync({ projectId: project.id, title: 'New issue' })
    openStory(story.id)
  }

  const viewSegment = currentPath.match(/\/p\/[^/]+\/([^/?]+)/)?.[1]

  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 0,
          borderRadius: 4, marginBottom: 1,
          background: active && !PROJECT_SUB_VIEWS.some(sv => sv.view === viewSegment)
            ? 'var(--active)'
            : hovered ? 'var(--hover)' : 'transparent',
        }}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
      >
        <button
          type="button"
          onClick={onClick}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 7,
            padding: '4px 8px',
            color: active ? 'var(--fg)' : 'var(--fg-1)',
            minWidth: 0,
          }}
        >
          <ChevronRight
            size={10}
            style={{
              flexShrink: 0, color: 'var(--fg-3)',
              transform: active ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.15s',
            }}
          />
          <span style={{ width: 8, height: 8, borderRadius: 2, background: project.color, flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.name}</span>
        </button>
        {hovered && (
          <div style={{ display: 'flex', alignItems: 'center', paddingRight: 4, gap: 1 }}>
            <RowIconBtn title="Create task" onClick={e => void handleCreateTask(e)}>
              <Plus size={11} />
            </RowIconBtn>
            <RowIconBtn title="Edit" onClick={e => { e.stopPropagation(); onEdit() }}>
              <Pencil size={11} />
            </RowIconBtn>
            <RowIconBtn title="Delete" onClick={e => { e.stopPropagation(); setConfirming(true) }}>
              <Trash2 size={11} />
            </RowIconBtn>
          </div>
        )}
      </div>

      {active && (
        <div style={{ marginBottom: 2 }}>
          {PROJECT_SUB_VIEWS.map(({ view, label, icon }) => {
            const isActive = viewSegment === view
            return (
              <SubNavRow
                key={view}
                icon={icon}
                label={label}
                active={isActive}
                onClick={() => navigate(projectPath(project.key, view))}
              />
            )
          })}
        </div>
      )}

      <ConfirmModal
        open={confirming}
        title="Delete project"
        message={`"${project.name}" and all its epics, sprints, and stories will be permanently deleted.`}
        onConfirm={() => deleteProject.mutate(project.id)}
        onClose={() => setConfirming(false)}
      />
    </>
  )
}

function SubNavRow({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '3px 8px 3px 26px',
        borderRadius: 4, width: '100%', textAlign: 'left',
        fontSize: 14, fontWeight: active ? 500 : 400,
        color: active ? 'var(--fg)' : 'var(--fg-2)',
        background: active ? 'var(--active)' : hovered ? 'var(--hover)' : 'transparent',
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <span style={{ color: 'var(--fg-3)', display: 'flex' }}>{icon}</span>
      {label}
    </button>
  )
}

function RowIconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: React.MouseEventHandler }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{ color: 'var(--fg-3)', padding: 3, borderRadius: 3, display: 'flex' }}
      onMouseOver={e => (e.currentTarget.style.color = 'var(--fg)')}
      onMouseOut={e => (e.currentTarget.style.color = 'var(--fg-3)')}
    >
      {children}
    </button>
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
