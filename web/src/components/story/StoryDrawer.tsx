import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useStory, useUpdateStory } from '../../api/stories'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import {
  FIBONACCI_POINTS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type StoryPriority,
  type StoryStatus,
  type UpdateStoryPayload,
} from '../../types'
import {
  AssigneeAvatar,
  Label,
  PriorityBars,
  StatusDot,
  StoryId,
} from './StoryPrimitives'

export function StoryDrawer() {
  const { storyId, closeStory } = useAppNavigate()
  const open = !!storyId

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeStory()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeStory])

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && closeStory()}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 40,
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: 'min(860px, 100vw)',
            zIndex: 50,
            background: 'var(--panel)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            outline: 'none',
          }}
          aria-describedby={undefined}
        >
          {storyId && <StoryDrawerBody storyId={storyId} onClose={closeStory} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function StoryDrawerBody({ storyId, onClose }: { storyId: string; onClose: () => void }) {
  const { data: story, isLoading, isError } = useStory(storyId)
  const update = useUpdateStory()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (story) {
      setTitle(story.title)
      setDescription(story.description ?? '')
    }
  }, [story?.id, story?.title, story?.description])

  const save = (patch: UpdateStoryPayload) => {
    if (!story) return
    update.mutate({ id: story.id, ...patch })
  }

  if (isLoading) {
    return <DrawerMessage>Loading story…</DrawerMessage>
  }

  if (isError || !story) {
    return <DrawerMessage>Could not load story.</DrawerMessage>
  }

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <StoryId id={story.storyId} />
        <span style={{ color: 'var(--fg-4)' }}>·</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--fg-2)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 1, background: story.epicColor }} />
          {story.epicTitle}
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--fg-2)', padding: '4px 6px' }}>
          <X size={14} />
          Close
          <span className="kbd" style={{ marginLeft: 2 }}>Esc</span>
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', flex: 1, minHeight: 0 }}>
        <div style={{ padding: '18px 22px', overflow: 'auto', borderRight: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
            <span style={{ marginTop: 6 }}>
              <StatusDot status={story.status} size={12} />
            </span>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => title !== story.title && save({ title })}
              style={{
                flex: 1,
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.18,
                letterSpacing: '-0.015em',
                color: 'var(--fg)',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: 0,
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
            <StatusPill status={story.status} onChange={s => save({ status: s })} />
            {story.blocked && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 8px',
                  background: 'rgba(248,113,113,0.10)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 4,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: 'var(--blocked)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Blocked
              </span>
            )}
          </div>

          <Section title="Description">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={() => description !== (story.description ?? '') && save({ description })}
              placeholder="Add a description…"
              rows={6}
              style={{
                width: '100%',
                fontSize: 13,
                color: 'var(--fg-1)',
                lineHeight: 1.55,
                background: 'var(--bg-1)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '10px 12px',
                resize: 'vertical',
                minHeight: 120,
              }}
            />
          </Section>
        </div>

        <aside style={{ overflow: 'auto', padding: '14px 14px 24px' }}>
          <Prop label="Status">
            <StatusSelect value={story.status} onChange={s => save({ status: s })} />
          </Prop>

          <Prop label="Assignee">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AssigneeAvatar assigneeId={story.assigneeId} />
              <span style={{ fontSize: 12.5, color: 'var(--fg-2)' }}>
                {story.assigneeId ? 'Assigned' : 'Unassigned'}
              </span>
            </span>
          </Prop>

          <Prop label="Priority">
            <PrioritySelect value={story.priority} onChange={p => save({ priority: p })} />
          </Prop>

          <Prop label="Story points">
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {FIBONACCI_POINTS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => save({ points: n })}
                  style={{
                    width: 26,
                    height: 24,
                    borderRadius: 4,
                    background: n === story.points ? 'var(--accent)' : 'var(--bg-2)',
                    color: n === story.points ? 'var(--accent-ink)' : 'var(--fg-1)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor: n === story.points ? 'transparent' : 'var(--border-1)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </Prop>

          <Prop label="Sprint">
            {story.sprintName ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '2px 8px',
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--accent-line)',
                  borderRadius: 3,
                  fontSize: 11.5,
                  color: 'var(--accent-fg)',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)' }} />
                <span className="mono">{story.sprintName}</span>
                {story.sprintState && (
                  <span style={{ color: 'var(--fg-3)' }}>· {story.sprintState}</span>
                )}
              </span>
            ) : (
              <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Backlog</span>
            )}
          </Prop>

          <Prop label="Epic">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 1, background: story.epicColor }} />
              <span style={{ fontSize: 12.5 }}>{story.epicTitle}</span>
            </span>
          </Prop>

          <Prop label="Blocked">
            <button
              type="button"
              onClick={() => save({ blocked: !story.blocked })}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid var(--border-1)',
                background: story.blocked ? 'rgba(248,113,113,0.12)' : 'var(--bg-2)',
                color: story.blocked ? 'var(--blocked)' : 'var(--fg-2)',
              }}
            >
              {story.blocked ? 'Yes — click to clear' : 'No'}
            </button>
          </Prop>

          {story.labels.length > 0 && (
            <Prop label="Labels">
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {story.labels.map(l => (
                  <Label key={l} name={l} />
                ))}
              </div>
            </Prop>
          )}

          {story.dueDate && (
            <Prop label="Due date">
              <span style={{ fontSize: 12.5 }}>{story.dueDate}</span>
            </Prop>
          )}
        </aside>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 24 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </span>
        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </header>
      {children}
    </section>
  )
}

function Prop({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function StatusPill({ status, onChange }: { status: StoryStatus; onChange: (s: StoryStatus) => void }) {
  const colors: Record<StoryStatus, { bg: string; border: string; fg: string }> = {
    todo: { bg: 'var(--bg-2)', border: 'var(--border-1)', fg: 'var(--fg-1)' },
    progress: { bg: 'rgba(76,201,231,0.12)', border: 'rgba(76,201,231,0.3)', fg: '#7ddcec' },
    review: { bg: 'rgba(240,179,74,0.12)', border: 'rgba(240,179,74,0.3)', fg: '#f0b34a' },
    done: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', fg: '#4ade80' },
  }
  const c = colors[status]
  return (
    <button
      type="button"
      onClick={() => {
        const order: StoryStatus[] = ['todo', 'progress', 'review', 'done']
        const next = order[(order.indexOf(status) + 1) % order.length]
        onChange(next)
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 8px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 4,
        fontSize: 11.5,
        fontWeight: 500,
        color: c.fg,
      }}
    >
      <StatusDot status={status} size={9} />
      {STATUS_LABELS[status]}
    </button>
  )
}

function StatusSelect({ value, onChange }: { value: StoryStatus; onChange: (s: StoryStatus) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as StoryStatus)}
      style={{
        width: '100%',
        fontSize: 12.5,
        padding: '6px 8px',
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 4,
        color: 'var(--fg)',
      }}
    >
      {(Object.keys(STATUS_LABELS) as StoryStatus[]).map(s => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}

function PrioritySelect({ value, onChange }: { value: StoryPriority; onChange: (p: StoryPriority) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <PriorityBars priority={value} />
      <select
        value={value}
        onChange={e => onChange(e.target.value as StoryPriority)}
        style={{
          flex: 1,
          fontSize: 12.5,
          padding: '6px 8px',
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          color: 'var(--fg)',
        }}
      >
        {(Object.keys(PRIORITY_LABELS) as StoryPriority[]).map(p => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>
    </div>
  )
}

function DrawerMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 24, color: 'var(--fg-2)', fontSize: 13 }}>{children}</div>
  )
}
