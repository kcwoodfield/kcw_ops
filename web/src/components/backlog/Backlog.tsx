import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBacklog, useCreateStory } from '../../api/stories'
import { useEpics } from '../../api/epics'
import { useUiStore } from '../../store/ui'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { Label, PriorityBars, Pts, StatusDot, StoryId } from '../story/StoryPrimitives'

type Tab = 'all' | 'urgent_high'

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, med: 2, low: 3 }

export function Backlog() {
  const { activeProjectId } = useUiStore()
  const { data: stories = [], isLoading } = useBacklog(activeProjectId ?? '')
  const { data: epics = [] } = useEpics(activeProjectId ?? '')
  const { openStory } = useAppNavigate()
  const createStory = useCreateStory()

  const [tab, setTab] = useState<Tab>('all')
  const [epicFilter, setEpicFilter] = useState('')

  const visible = stories
    .filter(s => tab === 'all'
      ? s.status !== 'done'
      : s.priority === 'urgent' || s.priority === 'high')
    .filter(s => !epicFilter || s.epicId === epicFilter)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))

  const totalPts = visible.reduce((a, s) => a + s.points, 0)

  const counts: Record<Tab, number> = {
    all: stories.filter(s => s.status !== 'done').length,
    urgent_high: stories.filter(s => s.priority === 'urgent' || s.priority === 'high').length,
  }

  const handleCreate = async () => {
    if (!activeProjectId || !epics.length) return
    const s = await createStory.mutateAsync({
      projectId: activeProjectId,
      epicId: epics[0].id,
      title: 'New issue',
    })
    openStory(s.id)
  }

  if (!activeProjectId) return <Shell>Select a project</Shell>
  if (isLoading) return <Shell>Loading backlog…</Shell>

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid', gridTemplateRows: '40px 36px 1fr',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      <style>{`
        .bl-row:nth-child(even) { background: var(--bg-1); }
        .bl-row:hover { background: var(--bg-2) !important; cursor: pointer; }
      `}</style>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Backlog</span>
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
          {visible.length} {visible.length === 1 ? 'story' : 'stories'} · {totalPts} pts
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          disabled={!epics.length || createStory.isPending}
          onClick={() => void handleCreate()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 26, padding: '0 10px',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--r-sm)',
            fontSize: 12, fontWeight: 600,
            opacity: !epics.length ? 0.5 : 1,
          }}
        >
          <Plus size={12} />
          New issue
        </button>
      </div>

      {/* ── Filter rail ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 16px', borderBottom: '1px solid var(--border)',
        overflow: 'hidden', flexShrink: 0,
      }}>
        {(['all', 'urgent_high'] as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              height: 22, padding: '0 10px', borderRadius: 3,
              background: tab === t ? 'var(--bg-2)' : 'transparent',
              boxShadow: tab === t ? '0 0 0 1px var(--border-1)' : 'none',
              color: tab === t ? 'var(--fg)' : 'var(--fg-2)',
              fontSize: 12, fontWeight: tab === t ? 500 : 400, flexShrink: 0,
            }}
          >
            {t === 'all' ? 'All open' : 'Urgent + High'}
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{counts[t]}</span>
          </button>
        ))}

        <span style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />

        <select
          value={epicFilter}
          onChange={e => setEpicFilter(e.target.value)}
          style={{
            height: 22, padding: '0 6px',
            background: epicFilter ? 'var(--bg-2)' : 'transparent',
            border: `1px ${epicFilter ? 'solid' : 'dashed'} var(--border-1)`,
            borderRadius: 4, fontSize: 11.5,
            color: epicFilter ? 'var(--fg)' : 'var(--fg-2)',
            maxWidth: 160, flexShrink: 0,
          }}
        >
          <option value="">Epic: All</option>
          {epics.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', flexShrink: 0 }}>
          sorted by priority ↓
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div style={{ overflow: 'auto' }}>
        {visible.length === 0 ? (
          <div style={{
            padding: '48px 16px', textAlign: 'center',
            color: 'var(--fg-3)', fontSize: 13,
          }}>
            {stories.length === 0 ? 'No backlog stories — all caught up!' : 'No stories match this filter.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 90 }} />   {/* ID */}
              <col style={{ width: 28 }} />   {/* status */}
              <col />                          {/* title */}
              <col style={{ width: 152 }} />  {/* epic */}
              <col style={{ width: 182 }} />  {/* labels */}
              <col style={{ width: 52 }} />   {/* pts */}
              <col style={{ width: 48 }} />   {/* priority */}
            </colgroup>
            <thead>
              <tr style={{
                background: 'var(--bg-1)',
                position: 'sticky', top: 0, zIndex: 1,
                color: 'var(--fg-3)', fontSize: 10.5,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
              }}>
                <Th>ID</Th>
                <Th />
                <Th>Title</Th>
                <Th>Epic</Th>
                <Th>Labels</Th>
                <Th align="right">Pts</Th>
                <Th align="center">Pri</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id} className="bl-row" onClick={() => openStory(s.id)}>
                  <Td><StoryId id={s.storyId} /></Td>
                  <Td><StatusDot status={s.status} size={9} /></Td>
                  <Td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        flex: 1,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        color: 'var(--fg)', fontSize: 13,
                      }}>
                        {s.title}
                      </span>
                      {s.blocked && <BlockedBadge />}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
                      <span style={{ width: 6, height: 6, borderRadius: 1, background: s.epicColor, flexShrink: 0 }} />
                      <span style={{
                        fontSize: 12, color: 'var(--fg-1)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {s.epicTitle}
                      </span>
                    </span>
                  </Td>
                  <Td>
                    <span style={{ display: 'inline-flex', gap: 4 }}>
                      {s.labels.slice(0, 3).map(l => <Label key={l} name={l} />)}
                    </span>
                  </Td>
                  <Td align="right"><Pts n={s.points} /></Td>
                  <Td align="center"><PriorityBars priority={s.priority} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── helpers ──────────────────────────────────────────────────────

function Th({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th style={{
      padding: '6px 10px',
      textAlign: align ?? 'left',
      borderBottom: '1px solid var(--border)',
      fontWeight: 600,
    }}>
      {children}
    </th>
  )
}

function Td({ children, align }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <td style={{
      padding: '8px 10px',
      borderBottom: '1px solid var(--border)',
      verticalAlign: 'middle',
      textAlign: align ?? 'left',
    }}>
      {children}
    </td>
  )
}

function BlockedBadge() {
  return (
    <span style={{
      flexShrink: 0, fontSize: 9, fontWeight: 600,
      padding: '1px 4px', borderRadius: 2,
      background: 'rgba(248,113,113,0.13)',
      color: 'var(--blocked)',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      blocked
    </span>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: 'var(--fg-2)', fontSize: 13,
    }}>
      {children}
    </div>
  )
}
