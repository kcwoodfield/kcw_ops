import { useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { useBacklog, useCreateStory, useSprints, useUpdateStory } from '../../api/stories'
import { useUiStore } from '../../store/ui'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { Label, PriorityBars, Pts, StatusDot, StoryId } from '../story/StoryPrimitives'
import { EpicFilterPopover } from '../shared/EpicFilterPopover'
import type { StoryDto } from '../../types'

type Tab = 'all' | 'urgent_high'

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, med: 2, low: 3 }

export function Backlog() {
  const { activeProjectId } = useUiStore()
  const { data: stories = [], isLoading } = useBacklog(activeProjectId ?? '')
  const { data: sprints = [] } = useSprints(activeProjectId ?? '')
  const { openStory } = useAppNavigate()
  const createStory = useCreateStory()
  const updateStory = useUpdateStory()

  const [tab, setTab] = useState<Tab>('all')
  const [epicFilter, setEpicFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [targetSprint, setTargetSprint] = useState('')

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

  const allVisibleSelected = visible.length > 0 && visible.every(s => selected.has(s.id))
  const someSelected = selected.size > 0

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        visible.forEach(s => next.delete(s.id))
        return next
      })
    } else {
      setSelected(prev => new Set([...prev, ...visible.map(s => s.id)]))
    }
  }

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const moveToSprint = () => {
    if (!targetSprint) return
    selected.forEach(id => {
      updateStory.mutate({ id, sprintId: targetSprint, clearSprint: false })
    })
    setSelected(new Set())
  }

  const handleCreate = async () => {
    if (!activeProjectId) return
    const s = await createStory.mutateAsync({
      projectId: activeProjectId,
      title: 'New issue',
    })
    openStory(s.id)
  }

  const activeSprints = sprints.filter(s => s.state !== 'completed')

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
        .bl-cb { opacity: 0; transition: opacity 0.1s; }
        .bl-row:hover .bl-cb, .bl-cb.checked { opacity: 1; }
      `}</style>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Backlog</span>
        <span className="mono" style={{ fontSize: 13.5, color: 'var(--fg-3)' }}>
          {visible.length} {visible.length === 1 ? 'story' : 'stories'} · {totalPts} pts
        </span>
        <span style={{ flex: 1 }} />

        {someSelected && (
          <>
            <span className="mono" style={{ fontSize: 13.5, color: 'var(--fg-2)' }}>
              {selected.size} selected
            </span>
            <select
              value={targetSprint}
              onChange={e => setTargetSprint(e.target.value)}
              style={{
                height: 26, padding: '0 6px',
                background: 'var(--bg-2)', border: '1px solid var(--border-1)',
                borderRadius: 4, fontSize: 14, color: 'var(--fg)',
              }}
            >
              <option value="">Pick sprint…</option>
              {activeSprints.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
            <button
              type="button"
              disabled={!targetSprint || updateStory.isPending}
              onClick={moveToSprint}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                height: 26, padding: '0 10px',
                background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
                borderRadius: 'var(--r-sm)', fontSize: 14, fontWeight: 500,
                color: 'var(--accent-fg)', flexShrink: 0,
                opacity: !targetSprint ? 0.5 : 1,
              }}
            >
              <ArrowRight size={12} />
              Move to sprint
            </button>
            <span style={{ width: 1, height: 18, background: 'var(--border)' }} />
          </>
        )}

        <button
          type="button"
          disabled={createStory.isPending}
          onClick={() => void handleCreate()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 26, padding: '0 10px',
            background: 'var(--accent)', color: 'var(--accent-ink)',
            borderRadius: 'var(--r-sm)',
            fontSize: 14, fontWeight: 600,
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
              fontSize: 14, fontWeight: tab === t ? 500 : 400, flexShrink: 0,
            }}
          >
            {t === 'all' ? 'All open' : 'Urgent + High'}
            <span className="mono" style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{counts[t]}</span>
          </button>
        ))}

        <span style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />

        {activeProjectId && (
          <EpicFilterPopover projectId={activeProjectId} value={epicFilter} onChange={setEpicFilter} />
        )}

        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 13, color: 'var(--fg-3)', flexShrink: 0 }}>
          sorted by priority ↓
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div style={{ overflow: 'auto' }}>
        {visible.length === 0 ? (
          <div style={{
            padding: '48px 16px', textAlign: 'center',
            color: 'var(--fg-3)', fontSize: 15,
          }}>
            {stories.length === 0 ? 'No backlog stories — all caught up!' : 'No stories match this filter.'}
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: 560, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 32 }} />   {/* checkbox */}
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
                color: 'var(--fg-3)', fontSize: 12.5,
                textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
              }}>
                <th style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    style={{ width: 12, height: 12, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </th>
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
                <BacklogRow
                  key={s.id}
                  story={s}
                  checked={selected.has(s.id)}
                  onToggle={toggleOne}
                  onOpen={() => openStory(s.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function BacklogRow({ story: s, checked, onToggle, onOpen }: {
  story: StoryDto
  checked: boolean
  onToggle: (id: string, e: React.MouseEvent) => void
  onOpen: () => void
}) {
  return (
    <tr className="bl-row" onClick={onOpen}>
      <Td>
        <input
          type="checkbox"
          checked={checked}
          className={`bl-cb${checked ? ' checked' : ''}`}
          onClick={e => onToggle(s.id, e)}
          onChange={() => {}}
          style={{ width: 12, height: 12, accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
      </Td>
      <Td><StoryId id={s.storyId} /></Td>
      <Td><StatusDot status={s.status} size={9} /></Td>
      <Td>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            flex: 1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: 'var(--fg)', fontSize: 15,
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
            fontSize: 14, color: 'var(--fg-1)',
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
      flexShrink: 0, fontSize: 11, fontWeight: 600,
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
      color: 'var(--fg-2)', fontSize: 15,
    }}>
      {children}
    </div>
  )
}
