import { useEffect, useRef, useState } from 'react'
import { Bell, Filter, Plus, Search } from 'lucide-react'
import { useCreateStory } from '../../api/stories'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useUiStore } from '../../store/ui'
import { CreateEpicModal } from '../CreateEpicModal'
import { CreateSprintModal } from '../CreateSprintModal'

export function TopBar() {
  const { sprintId, openStory } = useAppNavigate()
  const { activeProjectId, setCmdPaletteOpen } = useUiStore()
  const createStory = useCreateStory()
  const [menuOpen, setMenuOpen] = useState(false)
  const [epicModalOpen, setEpicModalOpen] = useState(false)
  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

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
      {/* Center: search */}
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

      <div style={{ flex: 1 }} />

      {/* Right: Create + icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div ref={menuRef} style={{ position: 'relative', marginRight: 4 }}>
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
              position: 'absolute', top: 'calc(100% + 4px)', right: 0,
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

        <IconBtn icon={<Filter size={14} />} />
        <IconBtn icon={<Bell size={14} />} />
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

function IconBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <button type="button" style={{ color: 'var(--fg-2)', padding: 5, borderRadius: 4, display: 'flex' }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
      {icon}
    </button>
  )
}
