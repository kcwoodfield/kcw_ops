import { Settings, Plus } from 'lucide-react'
import { useStories } from '../../api/stories'
import { useUiStore } from '../../store/ui'
import type { StoryDto, StoryStatus } from '../../types'
import {
  AssigneeAvatar,
  Label,
  PriorityBars,
  Pts,
  StatusDot,
  StoryId,
} from '../story/StoryPrimitives'

const COLUMNS: {
  id: StoryStatus
  label: string
  accent?: boolean
}[] = [
  { id: 'todo', label: 'To do' },
  { id: 'progress', label: 'In Progress', accent: true },
  { id: 'review', label: 'In Review' },
  { id: 'done', label: 'Done' },
]

export function Kanban() {
  const { activeProjectId, activeSprintId } = useUiStore()
  const { data: stories = [], isLoading, isError } = useStories(
    activeProjectId ?? '',
    activeSprintId ?? undefined,
  )

  const grouped = Object.fromEntries(
    COLUMNS.map(c => [c.id, stories.filter(s => s.status === c.id)]),
  ) as Record<StoryStatus, StoryDto[]>

  const totalPts = stories.reduce((a, s) => a + s.points, 0)

  if (!activeProjectId) {
    return <EmptyState message="Select a project from the sidebar" />
  }

  if (!activeSprintId) {
    return <EmptyState message="Loading sprint…" />
  }

  if (isLoading) {
    return <EmptyState message="Loading board…" />
  }

  if (isError) {
    return (
      <EmptyState message="Could not load stories — is the API running on :5050?" />
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateRows: '36px 1fr',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 14px',
          borderBottom: '1px solid var(--border)',
          fontSize: 12,
          color: 'var(--fg-2)',
        }}
      >
        <FilterChip label="Group by" value="Status" />
        <FilterChip label="Epic" value="All" badge={String(new Set(stories.map(s => s.epicId)).size)} />
        <FilterChip label="Assignee" value="All" />
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
          {stories.length} issues · {totalPts} pts
        </span>
        <span style={{ width: 1, height: 14, background: 'var(--border)' }} />
        <button
          type="button"
          style={{ padding: '3px 6px', fontSize: 11.5, color: 'var(--fg-2)' }}
        >
          <Settings size={12} />
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          overflow: 'hidden',
        }}
      >
        {COLUMNS.map((col, i) => {
          const colStories = grouped[col.id]
          const pts = colStories.reduce((a, s) => a + s.points, 0)
          return (
            <Column
              key={col.id}
              col={col}
              stories={colStories}
              count={colStories.length}
              pts={pts}
              isLast={i === COLUMNS.length - 1}
            />
          )
        })}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  value,
  badge,
}: {
  label: string
  value: string
  badge?: string
}) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 22,
        padding: '0 8px',
        border: '1px dashed var(--border-1)',
        borderRadius: 4,
        color: 'var(--fg-2)',
        fontSize: 11.5,
      }}
    >
      <span style={{ color: 'var(--fg-3)' }}>{label}</span>
      <span style={{ color: 'var(--fg)' }}>{value}</span>
      {badge && (
        <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>
          · {badge}
        </span>
      )}
    </button>
  )
}

function Column({
  col,
  stories,
  count,
  pts,
  isLast,
}: {
  col: (typeof COLUMNS)[number]
  stories: StoryDto[]
  count: number
  pts: number
  isLast: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: isLast ? 'none' : '1px solid var(--border)',
        minWidth: 0,
        background: col.accent
          ? 'linear-gradient(180deg, var(--accent-tint) 0%, transparent 200px)'
          : 'transparent',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px 8px',
          position: 'sticky',
          top: 0,
          background: 'var(--bg)',
          zIndex: 1,
        }}
      >
        <StatusDot status={col.id} size={9} />
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-0.005em',
          }}
        >
          {col.label}
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
          {count}
        </span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
          {pts} pts
        </span>
        <button type="button" style={{ padding: 3, color: 'var(--fg-3)' }}>
          <Plus size={12} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: '0 10px 12px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {stories.map(s => (
          <KanbanCard key={s.id} story={s} />
        ))}
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px',
            fontSize: 11.5,
            color: 'var(--fg-3)',
            borderRadius: 4,
            border: '1px dashed transparent',
            marginTop: 2,
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'var(--border-1)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <Plus size={11} /> Add issue
        </button>
      </div>
    </div>
  )
}

function KanbanCard({ story }: { story: StoryDto }) {
  return (
    <article
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border)',
        borderRadius: 5,
        padding: '8px 10px 8px 11px',
        position: 'relative',
        cursor: 'grab',
        transition: 'border-color .12s, background .12s',
      }}
      onMouseOver={e => {
        e.currentTarget.style.borderColor = 'var(--border-2)'
      }}
      onMouseOut={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 8,
          bottom: 8,
          width: 2,
          borderRadius: 2,
          background: story.epicColor,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 5,
        }}
      >
        <StoryId id={story.storyId} />
        {story.blocked && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: '1px 4px',
              background: 'rgba(248,113,113,0.13)',
              color: 'var(--blocked)',
              borderRadius: 2,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            blocked
          </span>
        )}
        <span style={{ flex: 1 }} />
        <PriorityBars priority={story.priority} />
        <Pts n={story.points} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          alignItems: 'flex-start',
          fontSize: 13,
          color: 'var(--fg)',
          fontWeight: 450,
          lineHeight: 1.32,
          marginBottom: story.labels.length ? 8 : 6,
        }}
      >
        <span style={{ marginTop: 3, flex: '0 0 auto' }}>
          <StatusDot status={story.status} size={9} />
        </span>
        <span style={{ textWrap: 'pretty' }}>{story.title}</span>
      </div>

      {story.labels.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
            marginBottom: 6,
          }}
        >
          {story.labels.map(l => (
            <Label key={l} name={l} />
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--fg-3)',
          fontSize: 11,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 1,
              background: story.epicColor,
              opacity: 0.85,
            }}
          />
          <span className="mono" style={{ fontSize: 10.5 }}>
            {story.epicTitle}
          </span>
        </span>
        <span style={{ flex: 1 }} />
        {story.dueDate && (
          <span style={{ fontSize: 10.5 }}>{story.dueDate}</span>
        )}
        <AssigneeAvatar assigneeId={story.assigneeId} />
      </div>
    </article>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg-2)',
        fontSize: 13,
      }}
    >
      {message}
    </div>
  )
}
