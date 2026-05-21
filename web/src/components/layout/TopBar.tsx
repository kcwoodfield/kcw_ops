import { Search, Filter, Bell, LayoutDashboard, List, CalendarDays } from 'lucide-react'
import { useSprints } from '../../api/stories'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useUiStore } from '../../store/ui'
import type { AppView } from '../../lib/routes'

interface TopBarProps {
  breadcrumb: string[]
}

const TOP_VIEWS: { id: AppView; icon: React.ReactNode; label: string }[] = [
  { id: 'board', icon: <LayoutDashboard size={12} />, label: 'Board' },
  { id: 'list', icon: <List size={12} />, label: 'List' },
  { id: 'calendar', icon: <CalendarDays size={12} />, label: 'Calendar' },
]

export function TopBar({ breadcrumb }: TopBarProps) {
  const { view, sprintId, goToView, setSprint } = useAppNavigate()
  const { activeProjectId, setCmdPaletteOpen } = useUiStore()
  const { data: sprints = [] } = useSprints(activeProjectId ?? '')
  const activeSprint = sprints.find(s => s.id === sprintId) ?? sprints.find(s => s.state === 'active')

  return (
    <header style={{
      height: 80,
      display: 'flex', alignItems: 'center',
      padding: '0 14px',
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      minWidth: 0,
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 12.5,
                color: i === breadcrumb.length - 1 ? 'var(--fg)' : 'var(--fg-2)',
                fontWeight: i === breadcrumb.length - 1 ? 500 : 400,
              }}>{crumb}</span>
              {i < breadcrumb.length - 1 && (
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              )}
            </span>
          ))}
        </div>

        {sprints.length > 0 && (
          <select
            value={sprintId ?? ''}
            onChange={e => setSprint(e.target.value || null)}
            className="mono"
            style={{
              padding: '3px 8px 3px 6px',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-line)',
              borderRadius: 4,
              fontSize: 11.5,
              fontWeight: 500,
              color: 'var(--accent-fg)',
              flexShrink: 0,
              maxWidth: 200,
            }}
          >
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
        {activeSprint && <SprintDaysLeft endDate={activeSprint.endDate} />}

        <ViewSwitcher view={view} onChange={goToView} />
      </div>

      {/* Center */}
      <button
        type="button"
        onClick={() => setCmdPaletteOpen(true)}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 8px', height: 26, width: 240,
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          color: 'var(--fg-3)',
          textAlign: 'left',
        }}
      >
        <Search size={13} />
        <span style={{ fontSize: 12, flex: 1 }}>Search issues, epics…</span>
        <span className="kbd">⌘K</span>
      </button>

      {/* Right */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        <IconBtn icon={<Filter size={14} />} />
        <IconBtn icon={<Bell size={14} />} />
      </div>
    </header>
  )
}

function ViewSwitcher({ view, onChange }: { view: AppView; onChange: (v: AppView) => void }) {
  return (
    <div style={{
      display: 'inline-flex',
      padding: 2,
      background: 'var(--bg-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      gap: 2,
      flexShrink: 0,
    }}>
      {TOP_VIEWS.map(v => (
        <button
          key={v.id}
          type="button"
          onClick={() => onChange(v.id)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 22, padding: '0 10px',
            fontSize: 12, fontWeight: 500,
            borderRadius: 'var(--r-xs)',
            color: view === v.id ? 'var(--fg)' : 'var(--fg-2)',
            background: view === v.id ? 'var(--bg-3)' : 'transparent',
            boxShadow: view === v.id ? '0 0 0 1px var(--border-1)' : 'none',
          }}
        >
          {v.icon}{v.label}
        </button>
      ))}
    </div>
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

function SprintDaysLeft({ endDate }: { endDate: string }) {
  const end = new Date(endDate)
  const today = new Date()
  const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return null
  return (
    <span style={{ color: 'var(--fg-3)', fontSize: 10.5, marginLeft: 2 }}>
      · {days}d left
    </span>
  )
}
