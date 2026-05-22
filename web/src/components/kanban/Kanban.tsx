import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Settings, Plus } from 'lucide-react'
import { useReorderStories, useSprints, useStories, useUpdateStory } from '../../api/stories'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useIsCompact } from '../../hooks/useMediaQuery'
import { useUiStore } from '../../store/ui'
import { EpicFilterPopover } from '../shared/EpicFilterPopover'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
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

const COLUMN_IDS = new Set<string>(COLUMNS.map(c => c.id))

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type ColumnItems = Record<StoryStatus, string[]>

function buildColumnItems(stories: StoryDto[]): ColumnItems {
  const sorted = [...stories].sort((a, b) => a.sortOrder - b.sortOrder)
  return Object.fromEntries(
    COLUMNS.map(c => [
      c.id,
      sorted.filter(s => s.status === c.id).map(s => s.id),
    ]),
  ) as ColumnItems
}

function findColumn(id: string, items: ColumnItems): StoryStatus | null {
  if (COLUMN_IDS.has(id)) return id as StoryStatus
  for (const col of COLUMNS) {
    if (items[col.id].includes(id)) return col.id
  }
  return null
}

export function Kanban() {
  const { activeProjectId, activeSprintId } = useUiStore()
  const { openStory } = useAppNavigate()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )
  const { data: sprints = [], isLoading: sprintsLoading } = useSprints(activeProjectId ?? '')
  const { data: stories = [], isLoading, isError } = useStories(
    activeProjectId ?? '',
    activeSprintId ?? undefined,
  )
  const updateStory = useUpdateStory()
  const reorderStories = useReorderStories()
  const compact = useIsCompact()
  const [epicFilter, setEpicFilter] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [items, setItems] = useState<ColumnItems>(() => buildColumnItems([]))
  const didDragRef = useRef(false)

  const storyMap = useMemo(
    () => Object.fromEntries(stories.map(s => [s.id, s])) as Record<string, StoryDto>,
    [stories],
  )

  useEffect(() => {
    // Only sync from server when not dragging. Removing activeId from deps
    // prevents the snap-back: without this, the effect fires the moment
    // activeId becomes null (drag end) and rebuilds from stale server state
    // before the mutation has returned.
    if (activeId === null) setItems(buildColumnItems(stories))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories])

  const activeStory = activeId ? storyMap[activeId] : null
  const totalPts = stories.reduce((a, s) => a + s.points, 0)

  const handleDragStart = (event: DragStartEvent) => {
    didDragRef.current = true
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeColumn = findColumn(String(active.id), items)
    const overColumn =
      findColumn(String(over.id), items) ??
      (COLUMN_IDS.has(String(over.id)) ? (String(over.id) as StoryStatus) : null)

    if (!activeColumn || !overColumn) return

    if (activeColumn === overColumn) {
      const activeIndex = items[activeColumn].indexOf(String(active.id))
      const overIndex = items[overColumn].indexOf(String(over.id))
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return
      setItems(prev => ({
        ...prev,
        [activeColumn]: arrayMove(prev[activeColumn], activeIndex, overIndex),
      }))
      return
    }

    setItems(prev => {
      const source = [...prev[activeColumn]]
      const target = [...prev[overColumn]]
      const activeIndex = source.indexOf(String(active.id))
      if (activeIndex === -1) return prev

      source.splice(activeIndex, 1)
      const overIndex = target.indexOf(String(over.id))
      const insertAt = overIndex >= 0 ? overIndex : target.length
      target.splice(insertAt, 0, String(active.id))

      return { ...prev, [activeColumn]: source, [overColumn]: target }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setTimeout(() => {
      didDragRef.current = false
    }, 0)

    if (!over || !activeProjectId) return

    const story = storyMap[String(active.id)]
    if (!story) return

    // Source column is the story's status before the drag. It can't be
    // derived from `items` — handleDragOver already moved the card into the
    // destination column, so findColumn(active.id, items) returns the dest.
    const sourceColumn = story.status
    const destColumn =
      findColumn(String(over.id), items) ??
      (COLUMN_IDS.has(String(over.id)) ? (String(over.id) as StoryStatus) : null)

    if (!destColumn) return

    if (sourceColumn !== destColumn) {
      updateStory.mutate(
        { id: story.id, status: destColumn },
        {
          onSuccess: () => {
            reorderStories.mutate({
              projectId: activeProjectId,
              sprintId: activeSprintId ?? undefined,
              status: sourceColumn,
              orderedStoryIds: items[sourceColumn],
            })
            reorderStories.mutate({
              projectId: activeProjectId,
              sprintId: activeSprintId ?? undefined,
              status: destColumn,
              orderedStoryIds: items[destColumn],
            })
          },
        },
      )
    } else {
      reorderStories.mutate({
        projectId: activeProjectId,
        sprintId: activeSprintId ?? undefined,
        status: sourceColumn,
        orderedStoryIds: items[sourceColumn],
      })
    }
  }

  const handleCardOpen = (storyId: string) => {
    if (didDragRef.current) return
    openStory(storyId)
  }

  if (!activeProjectId) {
    return <EmptyState message="Select a project from the sidebar" />
  }

  if (!activeSprintId) {
    if (!sprintsLoading && sprints.length === 0) {
      return (
        <EmptyState message="No sprints yet — create one in Sprint Planning to get started." />
      )
    }
    return <EmptyState message="Loading board…" />
  }

  if (isLoading) {
    return <EmptyState message="Loading board…" />
  }

  if (isError) {
    return (
      <EmptyState message="Could not load stories — is the API running on :5050?" />
    )
  }

  const dndContext = (children: React.ReactNode) => (
    <DndContext
      sensors={sensors}
      collisionDetection={args => {
        const pointer = pointerWithin(args)
        if (pointer.length > 0) return pointer
        return closestCenter(args)
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
        {activeStory ? <KanbanCard story={activeStory} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )

  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '36px 1fr', background: 'var(--bg)' }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--fg-2)' }}>
        {compact ? (
          <>
            {activeProjectId && (
              <EpicFilterPopover projectId={activeProjectId} value={epicFilter} onChange={setEpicFilter} />
            )}
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {stories.length} issues · {totalPts} pts
            </span>
          </>
        ) : (
          <>
            <FilterChip label="Group by" value="Status" />
            {activeProjectId && (
              <EpicFilterPopover projectId={activeProjectId} value={epicFilter} onChange={setEpicFilter} />
            )}
            <FilterChip label="Assignee" value="All" />
            <span style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {stories.length} issues · {totalPts} pts
            </span>
            <span style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <button type="button" style={{ padding: '3px 6px', fontSize: 11.5, color: 'var(--fg-2)' }}>
              <Settings size={12} />
            </button>
          </>
        )}
      </div>

      {/* ── Board ── */}
      {compact ? dndContext(
        <Tabs defaultValue="todo" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <TabsList style={{
            width: '100%', height: 38, borderRadius: 0, padding: '0 8px', gap: 2,
            background: 'var(--bg)', borderBottom: '1px solid var(--border)',
            justifyContent: 'stretch',
          }}>
            {COLUMNS.map(col => {
              const count = items[col.id].filter(id => !epicFilter || storyMap[id]?.epicId === epicFilter).length
              return (
                <TabsTrigger
                  key={col.id}
                  value={col.id}
                  style={{ flex: 1, gap: 5, fontSize: 11.5, padding: '0 4px', minWidth: 0 }}
                >
                  <StatusDot status={col.id} size={7} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.55 }}>{count}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {COLUMNS.map(col => {
            const ids = items[col.id]
            const colStories = ids.map(id => storyMap[id]).filter(Boolean)
              .filter(s => !epicFilter || s.epicId === epicFilter)
            return (
              <TabsContent
                key={col.id}
                value={col.id}
                style={{ flex: 1, overflow: 'auto', margin: 0, outline: 'none' }}
              >
                <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {ids.map(id => {
                      const story = colStories.find(s => s.id === id)
                      if (!story) return null
                      return <SortableKanbanCard key={id} story={story} onOpen={() => handleCardOpen(id)} />
                    })}
                    <button
                      type="button"
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', fontSize: 11.5, color: 'var(--fg-3)', borderRadius: 4, border: '1px dashed transparent', marginTop: 2 }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-1)' }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent' }}
                    >
                      <Plus size={11} /> Add issue
                    </button>
                  </div>
                </SortableContext>
              </TabsContent>
            )
          })}
        </Tabs>
      ) : dndContext(
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', overflow: 'hidden', height: '100%' }}>
          {COLUMNS.map((col, i) => {
            const ids = items[col.id]
            const colStories = ids.map(id => storyMap[id]).filter(Boolean)
              .filter(s => !epicFilter || s.epicId === epicFilter)
            const pts = colStories.reduce((a, s) => a + s.points, 0)
            return (
              <Column
                key={col.id}
                col={col}
                itemIds={ids}
                stories={colStories}
                count={colStories.length}
                pts={pts}
                isLast={i === COLUMNS.length - 1}
                onOpenCard={handleCardOpen}
              />
            )
          })}
        </div>
      )}
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
  itemIds,
  stories,
  count,
  pts,
  isLast,
  onOpenCard,
}: {
  col: (typeof COLUMNS)[number]
  itemIds: string[]
  stories: StoryDto[]
  count: number
  pts: number
  isLast: boolean
  onOpenCard: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: isLast ? 'none' : '1px solid var(--border)',
        minWidth: 0,
        minHeight: 0,
        background: col.accent
          ? 'linear-gradient(180deg, var(--accent-tint) 0%, transparent 200px)'
          : 'transparent',
        outline: isOver ? '1px solid var(--accent-line)' : 'none',
        outlineOffset: -1,
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

      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          style={{
            flex: 1,
            padding: '0 10px 12px',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minHeight: 80,
          }}
        >
          {itemIds.map(id => {
            const story = stories.find(s => s.id === id)
            if (!story) return null
            return (
              <SortableKanbanCard key={id} story={story} onOpen={() => onOpenCard(id)} />
            )
          })}
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
      </SortableContext>
    </div>
  )
}

function SortableKanbanCard({
  story,
  onOpen,
}: {
  story: StoryDto
  onOpen: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: story.id,
    data: { story, column: story.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.35 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <KanbanCard story={story} onClick={onOpen} />
    </div>
  )
}

function KanbanCard({
  story,
  onClick,
  isOverlay,
}: {
  story: StoryDto
  onClick?: () => void
  isOverlay?: boolean
}) {
  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
      style={{
        background: 'var(--bg-1)',
        border: `1px solid ${isOverlay ? 'var(--accent-line)' : 'var(--border)'}`,
        borderRadius: 5,
        padding: '8px 10px 8px 11px',
        position: 'relative',
        cursor: isOverlay ? 'grabbing' : 'grab',
        boxShadow: isOverlay ? 'var(--shadow-2)' : 'none',
        transition: isOverlay ? 'none' : 'border-color .12s',
        touchAction: 'none',
      }}
      onMouseOver={
        onClick && !isOverlay
          ? e => {
              e.currentTarget.style.borderColor = 'var(--border-2)'
            }
          : undefined
      }
      onMouseOut={
        onClick && !isOverlay
          ? e => {
              e.currentTarget.style.borderColor = 'var(--border)'
            }
          : undefined
      }
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
        {story.dueDate && <span style={{ fontSize: 10.5 }}>{fmtDate(story.dueDate)}</span>}
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
