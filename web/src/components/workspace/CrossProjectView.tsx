import { useNavigate, useSearchParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useUpdateStory } from '../../api/stories'
import { StatusDot, StoryId, PriorityBars, Pts } from '../story/StoryPrimitives'
import type { StoryDto } from '../../types'

export type GroupMode = 'project' | 'urgency'

interface CrossProjectViewProps {
  stories: StoryDto[]
  isLoading: boolean
  emptyText: string
  groupBy?: GroupMode
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function urgencyGroup(iso: string): 'overdue' | 'today' | 'week' {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [y, m, d] = iso.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  if (due < today) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'week'
}

const URGENCY_ORDER = ['overdue', 'today', 'week'] as const
const URGENCY_LABELS: Record<string, string> = {
  overdue: 'Overdue',
  today:   'Due today',
  week:    'Due this week',
}
const URGENCY_COLOR: Record<string, string> = {
  overdue: 'var(--blocked)',
  today:   'var(--review)',
  week:    'var(--fg)',
}

export function CrossProjectView({ stories, isLoading, emptyText, groupBy = 'project' }: CrossProjectViewProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const openStory = (id: string) => {
    const p = new URLSearchParams(searchParams)
    p.set('story', id)
    navigate({ search: p.toString() })
  }

  if (isLoading) return <Centered>Loading…</Centered>
  if (stories.length === 0) return <Centered>{emptyText}</Centered>

  let groups: { key: string; label: string; color?: string; stories: StoryDto[] }[]

  if (groupBy === 'urgency') {
    const byGroup: Record<string, StoryDto[]> = { overdue: [], today: [], week: [] }
    for (const s of stories) {
      if (s.dueDate) byGroup[urgencyGroup(s.dueDate)].push(s)
    }
    groups = URGENCY_ORDER
      .filter(k => byGroup[k].length > 0)
      .map(k => ({ key: k, label: URGENCY_LABELS[k], color: URGENCY_COLOR[k], stories: byGroup[k] }))
  } else {
    const byProject: Record<string, StoryDto[]> = {}
    for (const s of stories) {
      if (!byProject[s.projectKey]) byProject[s.projectKey] = []
      byProject[s.projectKey].push(s)
    }
    groups = Object.entries(byProject).map(([key, ss]) => ({ key, label: key, stories: ss }))
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto', padding: '0 0 32px' }}>
      {groups.map(g => (
        <section key={g.key} style={{ marginBottom: 4 }}>
          <header style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px 6px',
            position: 'sticky', top: 0,
            background: 'var(--bg)', zIndex: 1,
          }}>
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: g.color ?? 'var(--fg)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {g.label}
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{g.stories.length}</span>
          </header>
          {g.stories.map(s => (
            <StoryRow key={s.id} story={s} onOpen={() => openStory(s.id)} />
          ))}
        </section>
      ))}
    </div>
  )
}

function StoryRow({ story: s, onOpen }: { story: StoryDto; onOpen: () => void }) {
  const update = useUpdateStory()

  const toggleStar = (e: React.MouseEvent) => {
    e.stopPropagation()
    update.mutate({ id: s.id, starred: !s.starred })
  }

  const dueDateColor = s.dueDate
    ? urgencyGroup(s.dueDate) === 'overdue' ? 'var(--blocked)'
    : urgencyGroup(s.dueDate) === 'today'   ? 'var(--review)'
    : 'var(--fg-3)'
    : undefined

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr auto',
        alignItems: 'center',
        gap: 10,
        padding: '7px 16px',
        cursor: 'pointer',
        borderBottom: '1px solid var(--border)',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Status dot */}
      <StatusDot status={s.status} />

      {/* Main content */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <StoryId id={s.storyId} dim />
          <span style={{
            fontSize: 15, color: 'var(--fg)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {s.title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12.5, color: 'var(--fg-3)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: s.epicColor, flexShrink: 0 }} />
            {s.epicTitle}
          </span>
          {s.sprintName && (
            <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{s.sprintName}</span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {s.dueDate && (
          <span className="mono" style={{ fontSize: 13, color: dueDateColor }}>{fmtDate(s.dueDate)}</span>
        )}
        <PriorityBars priority={s.priority} />
        <Pts n={s.points} />
        <button
          type="button"
          onClick={toggleStar}
          title={s.starred ? 'Unstar' : 'Star'}
          style={{
            display: 'flex', padding: 2, borderRadius: 3,
            color: s.starred ? 'var(--review)' : 'var(--fg-3)',
          }}
          onMouseOver={e => (e.currentTarget.style.color = s.starred ? 'var(--review)' : 'var(--fg-2)')}
          onMouseOut={e => (e.currentTarget.style.color = s.starred ? 'var(--review)' : 'var(--fg-3)')}
        >
          <Star size={12} fill={s.starred ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-2)', fontSize: 15 }}>
      {children}
    </div>
  )
}
