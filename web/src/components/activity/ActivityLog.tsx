import { useActivity } from '../../api/activity'
import { useActiveProjectId } from '../../hooks/useAppNavigate'
import { useIsCompact } from '../../hooks/useMediaQuery'
import type { ActivityEventDto } from '../../types'

const TYPE_COLOR: Record<string, string> = {
  comment_added:        'var(--accent)',
  status_changed:       'var(--progress)',
  points_changed:       'var(--review)',
  added_to_sprint:      'var(--done)',
  removed_from_sprint:  'var(--fg-3)',
  assignee_changed:     'var(--fg-2)',
  sprint_started:       'var(--done)',
  sprint_completed:     'var(--fg-2)',
  sprint_updated:       'var(--fg-3)',
}

const TYPE_VERB: Record<string, string> = {
  comment_added:        'commented on',
  status_changed:       'moved',
  points_changed:       'estimated',
  added_to_sprint:      'added',
  removed_from_sprint:  'moved',
  assignee_changed:     'reassigned',
  sprint_started:       'started',
  sprint_completed:     'completed',
  sprint_updated:       'updated',
}

function groupByDay(events: ActivityEventDto[]) {
  const groups = new Map<string, ActivityEventDto[]>()
  for (const e of events) {
    const d = new Date(e.createdAt)
    const key = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }
  return [...groups.entries()]
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Sparkline({ events }: { events: ActivityEventDto[] }) {
  const buckets = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const key = d.toDateString()
    return events.filter(e => new Date(e.createdAt).toDateString() === key).length
  })
  const max = Math.max(...buckets, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18 }}>
      {buckets.map((v, i) => (
        <span key={i} style={{
          width: 3, height: `${Math.max(10, (v / max) * 100)}%`,
          background: i === 13 ? 'var(--accent)' : 'var(--fg-3)',
          opacity: i === 13 ? 1 : 0.3 + 0.5 * (v / max),
          borderRadius: 1,
        }} />
      ))}
    </div>
  )
}

export function ActivityLog() {
  const activeProjectId = useActiveProjectId()
  const { data: events = [], isLoading } = useActivity(activeProjectId ?? '')
  const compact = useIsCompact()

  if (!activeProjectId) return <Centered>Select a project</Centered>
  if (isLoading) return <Centered>Loading…</Centered>

  const groups = groupByDay(events)

  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '40px 1fr', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Activity</span>
        <span className="mono" style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>
          {events.length} events
        </span>
        <span style={{ width: 1, height: 18, background: 'var(--border)' }} />
        <Sparkline events={events} />
        <span style={{ flex: 1 }} />
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {Object.entries({ comment_added: 'comment', status_changed: 'status', points_changed: 'estimate', sprint_started: 'sprint', added_to_sprint: 'moved' }).map(([type, label]) => (
              <span key={type} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--fg-2)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 1, background: TYPE_COLOR[type] }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Feed ─────────────────────────────────────────────── */}
      <div style={{ overflow: 'auto', padding: '4px 0 32px' }}>
        {events.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 15 }}>
            No activity yet — create stories, update statuses, or leave comments.
          </div>
        ) : (
          groups.map(([day, dayEvents]) => (
            <section key={day} style={{ marginBottom: 8 }}>
              <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px 6px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{day}</span>
                <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{dayEvents.length} events</span>
              </header>
              <div style={{ padding: '0 16px' }}>
                {dayEvents.map((e, i) => (
                  <EventRow key={e.id} event={e} isLast={i === dayEvents.length - 1} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

function EventRow({ event: e, isLast }: { event: ActivityEventDto; isLast: boolean }) {
  const color = TYPE_COLOR[e.type] ?? 'var(--fg-3)'
  const verb = TYPE_VERB[e.type] ?? 'updated'
  const target = e.storyKey ?? e.sprintName ?? ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '12px 26px 1fr 72px', gap: 10, alignItems: 'start', padding: '6px 0', position: 'relative' }}>
      {/* timeline dot + line */}
      <div style={{ position: 'relative', height: '100%' }}>
        <span style={{ position: 'absolute', top: 7, left: 3, width: 6, height: 6, borderRadius: '50%', background: color }} />
        {!isLast && <span style={{ position: 'absolute', top: 14, bottom: -8, left: 5, width: 1, background: 'var(--border)' }} />}
      </div>

      {/* avatar */}
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: e.actorColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
        {e.actorInitials}
      </span>

      {/* body */}
      <div style={{ lineHeight: 1.45, fontSize: 14.5, color: 'var(--fg-1)', minWidth: 0 }}>
        <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{e.actorName}</span>
        {' '}<span style={{ color: 'var(--fg-2)' }}>{verb}</span>
        {target && <>{' '}<span className="mono" style={{ color: 'var(--fg)', fontSize: 13.5 }}>{target}</span></>}
        {e.detail && <div style={{ color: 'var(--fg-2)', fontSize: 14, marginTop: 1 }}>{e.detail}</div>}
      </div>

      {/* time */}
      <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-3)', textAlign: 'right', paddingTop: 2 }}>
        {relativeTime(e.createdAt)}
      </span>
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
