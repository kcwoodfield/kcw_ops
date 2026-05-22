import { useEffect, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Send, Trash2, X } from 'lucide-react'
import { useDeleteStory, useStory, useUpdateStory, useSprints } from '../../api/stories'
import { useComments, useAddComment } from '../../api/comments'
import { useUsers } from '../../api/users'
import { ConfirmModal } from '../shared/ConfirmModal'
import { useEpics } from '../../api/epics'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useIsCompact } from '../../hooks/useMediaQuery'
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
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(1020px, 95vw)',
            maxHeight: '90vh',
            zIndex: 50,
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            outline: 'none',
          }}
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Story detail</Dialog.Title>
          {storyId && <StoryDrawerBody storyId={storyId} onClose={closeStory} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function StoryDrawerBody({ storyId, onClose }: { storyId: string; onClose: () => void }) {
  const { data: story, isLoading, isError } = useStory(storyId)
  const update = useUpdateStory()
  const deleteStory = useDeleteStory()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { data: epics = [] } = useEpics(story?.projectId ?? '')
  const { data: sprints = [] } = useSprints(story?.projectId ?? '')
  const { data: users = [] } = useUsers()
  const { data: comments = [] } = useComments(storyId)
  const addComment = useAddComment(storyId)
  const compact = useIsCompact()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('kcw')
  const titleRef = useRef<HTMLInputElement>(null)
  const pendingRef = useRef({ title: '', description: '' })

  useEffect(() => {
    if (story) {
      setTitle(story.title)
      setDescription(story.description ?? '')
      if (story.title === 'New issue') {
        setTimeout(() => titleRef.current?.select(), 80)
      }
    }
  }, [story?.id])

  // Keep ref in sync so the ⌘+Enter handler always has fresh values
  useEffect(() => { pendingRef.current = { title, description } }, [title, description])

  const save = (patch: UpdateStoryPayload) => {
    if (!story) return
    update.mutate({ id: story.id, ...patch })
  }

  // Global ⌘+Enter saves and closes — works from any field in the drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        // Let the comment textarea handle its own ⌘+Enter (submit comment)
        if ((e.target as HTMLElement).closest('[data-comment-input]')) return
        e.preventDefault()
        save(pendingRef.current)
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, onClose])

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
        <button
          type="button"
          title="Delete story"
          onClick={() => setConfirmDelete(true)}
          style={{ display: 'flex', color: 'var(--fg-3)', padding: '4px 6px', borderRadius: 4 }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--blocked)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          <Trash2 size={14} />
        </button>
        <button type="button" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--fg-2)', padding: '4px 6px' }}>
          <X size={14} />
          Close
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 240px', flex: 1, minHeight: 0, overflow: compact ? 'auto' : undefined }}>
        <div style={{ padding: '18px 22px', overflow: compact ? 'visible' : 'auto', borderRight: compact ? 'none' : '1px solid var(--border)', borderBottom: compact ? '1px solid var(--border)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
            <span style={{ marginTop: 6 }}>
              <StatusDot status={story.status} size={12} />
            </span>
            <input
              ref={titleRef}
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
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  save({ title, description })
                  onClose()
                }
              }}
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

          <Section title="Activity" trail={comments.length ? `${comments.length}` : undefined}>
            {comments.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '6px 0', fontSize: 12.5 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.authorColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: '#fff' }}>
                      {c.authorInitials}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500, color: 'var(--fg)' }}>{c.authorName}</span>
                      <span className="mono" style={{ marginLeft: 8, fontSize: 10.5, color: 'var(--fg-3)' }}>
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div style={{ marginTop: 3, color: 'var(--fg-1)', lineHeight: 1.5 }}>{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
              <select
                value={commentAuthor}
                onChange={e => setCommentAuthor(e.target.value)}
                style={{ fontSize: 11, background: 'transparent', border: 'none', color: 'var(--fg-2)', padding: 0, flexShrink: 0, marginTop: 1 }}
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <textarea data-comment-input
                value={commentBody}
                onChange={e => setCommentBody(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    if (commentBody.trim()) {
                      addComment.mutate({ authorId: commentAuthor, body: commentBody.trim() })
                      setCommentBody('')
                    }
                  }
                }}
                placeholder="Leave a comment…"
                rows={2}
                style={{ flex: 1, fontSize: 12.5, color: 'var(--fg)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', lineHeight: 1.5 }}
              />
              <button
                type="button"
                disabled={!commentBody.trim() || addComment.isPending}
                onClick={() => {
                  if (!commentBody.trim()) return
                  addComment.mutate({ authorId: commentAuthor, body: commentBody.trim() })
                  setCommentBody('')
                }}
                style={{ color: commentBody.trim() ? 'var(--accent)' : 'var(--fg-4)', padding: 4, flexShrink: 0 }}
              >
                <Send size={13} />
              </button>
            </div>
          </Section>
        </div>

        <aside style={{ overflow: compact ? 'visible' : 'auto', padding: '14px 14px 24px' }}>
          <Prop label="Status">
            <StatusSelect value={story.status} onChange={s => save({ status: s })} />
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
                    width: 26, height: 24, borderRadius: 4,
                    background: n === story.points ? 'var(--accent)' : 'var(--bg-2)',
                    color: n === story.points ? 'var(--accent-ink)' : 'var(--fg-1)',
                    fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600,
                    border: '1px solid',
                    borderColor: n === story.points ? 'transparent' : 'var(--border-1)',
                  }}
                >{n}</button>
              ))}
            </div>
          </Prop>

          <Prop label="Sprint">
            <select
              value={story.sprintId ?? ''}
              onChange={e => {
                const v = e.target.value
                save(v ? { sprintId: v, clearSprint: false } : { clearSprint: true })
              }}
              style={selectStyle}
            >
              <option value="">Backlog</option>
              {sprints.map(sp => (
                <option key={sp.id} value={sp.id}>{sp.name}</option>
              ))}
            </select>
          </Prop>

          <Prop label="Epic">
            <select
              value={story.epicId}
              onChange={e => save({ epicId: e.target.value })}
              style={selectStyle}
            >
              {epics.map(ep => (
                <option key={ep.id} value={ep.id}>{ep.title}</option>
              ))}
            </select>
          </Prop>

          <Prop label="Due date">
            <input
              type="date"
              value={story.dueDate ?? ''}
              onChange={e => save({ dueDate: e.target.value || null })}
              style={{ ...selectStyle, colorScheme: 'dark' }}
            />
          </Prop>

          <Prop label="Blocked">
            <button
              type="button"
              onClick={() => save({ blocked: !story.blocked })}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 4,
                border: '1px solid var(--border-1)',
                background: story.blocked ? 'rgba(200,74,64,0.12)' : 'var(--bg-2)',
                color: story.blocked ? 'var(--blocked)' : 'var(--fg-2)',
              }}
            >
              {story.blocked ? 'Yes — click to clear' : 'No'}
            </button>
          </Prop>

          <Prop label="Starred">
            <button
              type="button"
              onClick={() => save({ starred: !story.starred })}
              style={{
                fontSize: 12, padding: '4px 10px', borderRadius: 4,
                border: '1px solid var(--border-1)',
                background: story.starred ? 'rgba(196,149,58,0.12)' : 'var(--bg-2)',
                color: story.starred ? 'var(--review)' : 'var(--fg-2)',
              }}
            >
              {story.starred ? 'Starred — click to remove' : 'Not starred'}
            </button>
          </Prop>

          <Prop label="Labels">
            <LabelsEditor labels={story.labels} onChange={labels => save({ labels })} />
          </Prop>

          <Prop label="Assignee">
            <select
              value={story.assigneeId ?? ''}
              onChange={e => save({ assigneeId: e.target.value || null })}
              style={selectStyle}
            >
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            {story.assigneeId && story.assigneeName && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: story.assigneeColor ?? '#7c5cff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {story.assigneeInitials}
                </span>
                <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>{story.assigneeName}</span>
              </div>
            )}
          </Prop>
        </aside>
      </div>

      <footer style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
        padding: '10px 16px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <button
          type="button"
          onClick={() => {
            setTitle(story.title)
            setDescription(story.description ?? '')
            onClose()
          }}
          style={{ height: 30, padding: '0 14px', background: 'transparent', border: '1px solid var(--border-1)', borderRadius: 4, fontSize: 12, color: 'var(--fg-2)' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => { save({ title, description }); onClose() }}
          style={{
            height: 30, padding: '0 16px', borderRadius: 4, fontSize: 12, fontWeight: 600,
            background: 'var(--accent)', color: 'var(--accent-ink)',
            border: '1px solid transparent',
          }}
        >
          Save
        </button>
      </footer>

      <ConfirmModal
        open={confirmDelete}
        title="Delete story"
        message={`"${story.title}" will be permanently deleted.`}
        onConfirm={() => deleteStory.mutate(story.id, { onSuccess: onClose })}
        onClose={() => setConfirmDelete(false)}
      />
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

const selectStyle: React.CSSProperties = {
  width: '100%', fontSize: 12.5, padding: '6px 8px',
  background: 'var(--bg-1)', border: '1px solid var(--border)',
  borderRadius: 4, color: 'var(--fg)',
}

function LabelsEditor({ labels, onChange }: { labels: string[]; onChange: (l: string[]) => void }) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const add = () => {
    const v = input.trim().toLowerCase()
    if (!v || labels.includes(v)) { setInput(''); return }
    onChange([...labels, v])
    setInput('')
  }

  const remove = (label: string) => onChange(labels.filter(l => l !== label))

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: labels.length ? 6 : 0 }}>
        {labels.map(l => (
          <button
            key={l}
            type="button"
            onClick={() => remove(l)}
            title="Click to remove"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 7px', borderRadius: 3,
              background: 'var(--bg-3)', border: '1px solid var(--border-1)',
              fontSize: 11, color: 'var(--fg-2)', cursor: 'pointer',
            }}
          >
            {l} <span style={{ opacity: 0.5 }}>×</span>
          </button>
        ))}
      </div>
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        onBlur={add}
        placeholder="Add label…"
        style={{
          ...selectStyle,
          padding: '5px 8px',
        }}
      />
    </div>
  )
}

function DrawerMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 24, color: 'var(--fg-2)', fontSize: 13 }}>{children}</div>
  )
}
