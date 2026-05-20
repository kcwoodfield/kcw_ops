import type { StoryDto } from '../../types'

export type StoryStatus = StoryDto['status']
export type StoryPriority = StoryDto['priority']

const PRIORITY_LEVEL: Record<StoryPriority, number> = {
  urgent: 0,
  high: 1,
  med: 2,
  low: 3,
}

export function StatusDot({ status, size = 9 }: { status: StoryStatus; size?: number }) {
  return (
    <span
      className={`status-dot ${status}`}
      style={{ width: size, height: size }}
    />
  )
}

export function PriorityBars({ priority }: { priority: StoryPriority }) {
  return (
    <span className={`priority-bars p${PRIORITY_LEVEL[priority]}`}>
      <span /><span /><span />
    </span>
  )
}

export function StoryId({ id, dim }: { id: string; dim?: boolean }) {
  return (
    <span
      className="mono"
      style={{
        color: dim ? 'var(--fg-3)' : 'var(--fg-2)',
        fontSize: 11,
        letterSpacing: '-0.01em',
      }}
    >
      {id}
    </span>
  )
}

export function Pts({ n }: { n: number }) {
  return <span className="pts mono">{n}</span>
}

export function AssigneeAvatar({ assigneeId }: { assigneeId: string | null }) {
  if (!assigneeId) {
    return (
      <span
        className="avatar-pip"
        style={{ color: 'var(--fg-3)', borderStyle: 'dashed' }}
      >
        ?
      </span>
    )
  }
  const initials = assigneeId.replace(/-/g, '').slice(0, 2)
  return <span className="avatar-pip">{initials}</span>
}

const LABEL_COLORS: Record<string, string> = {
  frontend: '#7c5cff',
  backend: '#4cc9e7',
  a11y: '#f0b34a',
  infra: '#94a3b8',
  audit: '#a78bfa',
  security: '#f87171',
  telemetry: '#4ade80',
  design: '#f0b34a',
  spec: '#94a3b8',
  i18n: '#4cc9e7',
  sso: '#a78bfa',
  docs: '#94a3b8',
  spike: '#f87171',
  analytics: '#4ade80',
}

export function Label({ name }: { name: string }) {
  const c = LABEL_COLORS[name] ?? '#94a3b8'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 16,
        padding: '0 5px 0 4px',
        fontSize: 10.5,
        fontWeight: 500,
        border: '1px solid var(--border-1)',
        borderRadius: 2,
        color: 'var(--fg-1)',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
      {name}
    </span>
  )
}
