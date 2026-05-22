import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Moon, Plus, Search, Sun, UserCircle } from 'lucide-react'
import { useCreateStory, useInboxStories } from '../../api/stories'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useUiStore } from '../../store/ui'
import { useAuthStore } from '../../store/auth'
import { useAuthFade } from '../../context/auth-fade'
import { useIsCompact } from '../../hooks/useMediaQuery'
import { CreateEpicModal } from '../CreateEpicModal'
import { CreateSprintModal } from '../CreateSprintModal'

export function TopBar() {
  const { sprintId, openStory } = useAppNavigate()
  const { activeProjectId, setCmdPaletteOpen, setMobileSidebarOpen, theme, toggleTheme } = useUiStore()
  const { logout } = useAuthStore()
  const { crossFade } = useAuthFade()
  const compact = useIsCompact()
  const createStory = useCreateStory()
  const navigate = useNavigate()
  const { data: inbox = [] } = useInboxStories()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [epicModalOpen, setEpicModalOpen] = useState(false)
  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  const handleNewIssue = async () => {
    setMenuOpen(false)
    if (!activeProjectId) return
    const story = await createStory.mutateAsync({
      projectId: activeProjectId,
      title: 'New issue',
      sprintId: sprintId ?? undefined,
    })
    openStory(story.id)
  }

  return (
    <header style={{
      height: 44,
      display: 'flex', alignItems: 'center',
      padding: '0 14px',
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      minWidth: 0, flexShrink: 0,
      position: 'relative',
    }}>
      {/* Compact: hamburger + search icon */}
      {compact && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileSidebarOpen(true)}
          style={{ color: 'var(--fg-1)', padding: 5, borderRadius: 4, display: 'flex', marginRight: 2 }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={17} />
        </button>
      )}

      {compact ? (
        <button
          type="button"
          aria-label="Search"
          onClick={() => setCmdPaletteOpen(true)}
          style={{ color: 'var(--fg-2)', padding: 5, borderRadius: 4, display: 'flex' }}
          onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Search size={15} />
        </button>
      ) : (
        /* Center: search */
        <button
          type="button"
          onClick={() => setCmdPaletteOpen(true)}
          style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 8px', height: 26, width: 240,
            background: 'var(--bg-1)', border: '1px solid var(--border)',
            borderRadius: 4, color: 'var(--fg-3)', textAlign: 'left',
          }}
        >
          <Search size={13} />
          <span style={{ fontSize: 12, flex: 1 }}>Search issues, epics…</span>
          <span className="kbd">⌘K</span>
        </button>
      )}

      {/* Left: Create */}
      <div ref={menuRef} style={{ position: 'relative', marginLeft: 8 }}>
        <button
          type="button"
          disabled={!activeProjectId}
          onClick={() => setMenuOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 28, padding: '0 12px',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 600,
            opacity: !activeProjectId ? 0.5 : 1,
          }}
        >
          <Plus size={12} /> Create
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0,
            background: 'var(--panel)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 0', minWidth: 160, zIndex: 100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}>
              <MenuItem onClick={() => void handleNewIssue()}>New issue</MenuItem>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <MenuItem onClick={() => { setMenuOpen(false); setSprintModalOpen(true) }}>New sprint</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); setEpicModalOpen(true) }}>New epic</MenuItem>
            </div>
          )}
        </div>

      <div style={{ flex: 1 }} />

      {/* Right: icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconBtn icon={<Bell size={14} />} badge={inbox.length > 0 ? inbox.length : undefined} onClick={() => navigate('/inbox')} />

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <IconBtn icon={<UserCircle size={16} />} onClick={() => setProfileOpen(v => !v)} />
          {profileOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', right: 0,
              background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '4px 0', minWidth: 160, zIndex: 200,
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}>
              <button
                type="button"
                onClick={() => { toggleTheme(); setProfileOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left',
                  padding: '7px 14px', fontSize: 12.5, color: 'var(--fg-1)',
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
                onClick={() => { setProfileOpen(false); void crossFade(() => void logout()) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left',
                  padding: '7px 14px', fontSize: 12.5, color: 'var(--fg-danger, #f87171)',
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

      {activeProjectId && (
        <>
          <CreateEpicModal projectId={activeProjectId} open={epicModalOpen} onClose={() => setEpicModalOpen(false)} />
          <CreateSprintModal projectId={activeProjectId} open={sprintModalOpen} onClose={() => setSprintModalOpen(false)} />
        </>
      )}
    </header>
  )
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '7px 14px', fontSize: 12.5, color: 'var(--fg-1)',
        background: 'transparent',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  )
}

function IconBtn({ icon, badge, onClick, title }: { icon: React.ReactNode; badge?: number; onClick?: () => void; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{ color: 'var(--fg-2)', padding: 5, borderRadius: 4, display: 'flex', position: 'relative' }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      {badge !== undefined && (
        <span style={{
          position: 'absolute', top: 1, right: 1,
          minWidth: 14, height: 14, borderRadius: 7,
          background: 'var(--accent)', color: 'var(--accent-ink)',
          fontSize: 9, fontWeight: 700, lineHeight: '14px',
          textAlign: 'center', padding: '0 3px',
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}
