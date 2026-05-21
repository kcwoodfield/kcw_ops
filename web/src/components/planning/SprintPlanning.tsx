import { useState } from 'react'
import { DndContext, DragOverlay, useDroppable, useDraggable, type DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, Play, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { useBacklog, useDeleteSprint, useSprints, useUpdateStory, useUpdateSprint } from '../../api/stories'
import { useEpics } from '../../api/epics'
import { useUiStore } from '../../store/ui'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useIsCompact } from '../../hooks/useMediaQuery'
import { CreateSprintModal } from '../CreateSprintModal'
import { ConfirmModal } from '../shared/ConfirmModal'
import { StatusDot, StoryId, PriorityBars, Pts } from '../story/StoryPrimitives'
import type { StoryDto, SprintDto } from '../../types'

const CAPACITY = 40

export function SprintPlanning() {
  const { activeProjectId, activeSprintId, setActiveSprint } = useUiStore()
  const { openStory } = useAppNavigate()
  const projectId = activeProjectId ?? ''

  const { data: backlog = [] } = useBacklog(projectId)
  const { data: allSprints = [] } = useSprints(projectId)
  const { data: epics = [] } = useEpics(projectId)
  const updateStory = useUpdateStory()
  const updateSprint = useUpdateSprint()

  const compact = useIsCompact()
  const [epicFilter, setEpicFilter] = useState<string>('all')
  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const [draggingStory, setDraggingStory] = useState<StoryDto | null>(null)

  const activeSprint = allSprints.find(s => s.id === activeSprintId) ?? allSprints.find(s => s.state === 'active') ?? allSprints[0]
  const { data: sprintStoriesRaw = [] } = useSprintStories(projectId, activeSprint?.id)

  const filteredBacklog = epicFilter === 'all'
    ? backlog
    : backlog.filter(s => s.epicId === epicFilter)

  const sprintPoints = sprintStoriesRaw.reduce((sum, s) => sum + s.points, 0)

  const handleDragEnd = (e: DragEndEvent) => {
    setDraggingStory(null)
    if (!e.over || !activeSprint) return
    const storyId = e.active.id as string
    const target = e.over.id as string

    if (target === 'sprint-drop' && backlog.find(s => s.id === storyId)) {
      updateStory.mutate({ id: storyId, sprintId: activeSprint.id, clearSprint: false })
    }
    if (target === 'backlog-drop' && sprintStoriesRaw.find(s => s.id === storyId)) {
      updateStory.mutate({ id: storyId, clearSprint: true })
    }
  }

  const moveToSprint = (story: StoryDto) => {
    if (!activeSprint) return
    updateStory.mutate({ id: story.id, sprintId: activeSprint.id, clearSprint: false })
  }

  const moveToBacklog = (story: StoryDto) => {
    updateStory.mutate({ id: story.id, clearSprint: true })
  }

  const startSprint = () => {
    if (!activeSprint) return
    updateSprint.mutate({ id: activeSprint.id, state: 'active' })
  }

  const completeSprint = () => {
    if (!activeSprint) return
    updateSprint.mutate({ id: activeSprint.id, state: 'completed' })
  }

  return (
    <DndContext
      onDragStart={e => {
        const story = [...backlog, ...sprintStoriesRaw].find(s => s.id === e.active.id)
        setDraggingStory(story ?? null)
      }}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', height: '100%', overflow: compact ? 'auto' : 'hidden', flexDirection: compact ? 'column' : 'row' }}>

        {/* ── LEFT: Backlog ── */}
        <BacklogPanel
          stories={filteredBacklog}
          epics={epics}
          epicFilter={epicFilter}
          onEpicFilter={setEpicFilter}
          onMoveToSprint={moveToSprint}
          hasSprint={!!activeSprint}
          compact={compact}
          onStoryClick={openStory}
        />

        {/* ── RIGHT: Sprint ── */}
        <SprintPanel
          sprint={activeSprint}
          allSprints={allSprints}
          stories={sprintStoriesRaw}
          sprintPoints={sprintPoints}
          onSelectSprint={s => setActiveSprint(s.id)}
          onMoveToBacklog={moveToBacklog}
          onStartSprint={startSprint}
          onCompleteSprint={completeSprint}
          onNewSprint={() => setSprintModalOpen(true)}
          onStoryClick={openStory}
        />
      </div>

      <DragOverlay>
        {draggingStory && <DragCard story={draggingStory} />}
      </DragOverlay>

      {projectId && (
        <CreateSprintModal projectId={projectId} open={sprintModalOpen} onClose={() => setSprintModalOpen(false)} />
      )}
    </DndContext>
  )
}

// ── Sub-components ────────────────────────────────────────────

function BacklogPanel({
  stories, epics, epicFilter, onEpicFilter, onMoveToSprint, hasSprint, compact, onStoryClick,
}: {
  stories: StoryDto[]
  epics: { id: string; title: string; color: string }[]
  epicFilter: string
  onEpicFilter: (id: string) => void
  onMoveToSprint: (s: StoryDto) => void
  hasSprint: boolean
  compact: boolean
  onStoryClick: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'backlog-drop' })

  return (
    <div
      ref={setNodeRef}
      style={{
        width: compact ? '100%' : '50%',
        minHeight: compact ? 300 : undefined,
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? 'var(--hover)' : 'var(--bg)',
        transition: 'background 0.12s',
      }}
    >
      <PanelHeader>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)' }}>
          Backlog
        </span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', marginLeft: 6 }}>
          {stories.length} stories
        </span>
        <div style={{ flex: 1 }} />
        <select
          value={epicFilter}
          onChange={e => onEpicFilter(e.target.value)}
          style={filterSelectStyle}
        >
          <option value="all">All epics</option>
          {epics.map(ep => (
            <option key={ep.id} value={ep.id}>{ep.title}</option>
          ))}
        </select>
      </PanelHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {stories.length === 0 ? (
          <Empty>Backlog is clear 🎉</Empty>
        ) : (
          stories.map(s => (
            <PlanningRow
              key={s.id}
              story={s}
              action={hasSprint ? { icon: <ChevronRight size={13} />, label: 'Add to sprint', onClick: () => onMoveToSprint(s) } : undefined}
              onClick={() => onStoryClick(s.id)}
              draggable
            />
          ))
        )}
      </div>
    </div>
  )
}

function SprintPanel({
  sprint, allSprints, stories, sprintPoints,
  onSelectSprint, onMoveToBacklog, onStartSprint, onCompleteSprint, onNewSprint, onStoryClick,
}: {
  sprint: SprintDto | undefined
  allSprints: SprintDto[]
  stories: StoryDto[]
  sprintPoints: number
  onSelectSprint: (s: SprintDto) => void
  onMoveToBacklog: (s: StoryDto) => void
  onStartSprint: () => void
  onCompleteSprint: () => void
  onNewSprint: () => void
  onStoryClick: (id: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: 'sprint-drop' })
  const deleteSprint = useDeleteSprint()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const pct = Math.min(100, Math.round((sprintPoints / CAPACITY) * 100))
  const over = sprintPoints > CAPACITY

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? 'var(--hover)' : 'var(--bg)',
        transition: 'background 0.12s',
      }}
    >
      <PanelHeader>
        {allSprints.length > 0 ? (
          <select
            value={sprint?.id ?? ''}
            onChange={e => {
              const s = allSprints.find(sp => sp.id === e.target.value)
              if (s) onSelectSprint(s)
            }}
            style={{ ...filterSelectStyle, fontWeight: 600, color: 'var(--fg)', fontSize: 13 }}
          >
            {allSprints.map(sp => (
              <option key={sp.id} value={sp.id}>{sp.name}</option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--fg-3)' }}>No sprints yet</span>
        )}

        <button type="button" onClick={onNewSprint} style={iconBtnStyle} title="New sprint">
          <Plus size={13} />
        </button>
        {sprint && (
          <button type="button" onClick={() => setConfirmDelete(true)} style={iconBtnStyle} title="Delete sprint">
            <Trash2 size={13} />
          </button>
        )}

        <div style={{ flex: 1 }} />

        {sprint && (
          <>
            {sprint.state === 'planned' && (
              <ActionBtn icon={<Play size={12} />} label="Start sprint" onClick={onStartSprint} variant="accent" />
            )}
            {sprint.state === 'active' && (
              <ActionBtn icon={<CheckCircle size={12} />} label="Complete sprint" onClick={onCompleteSprint} variant="secondary" />
            )}
          </>
        )}
      </PanelHeader>

      {sprint && (
        <div style={{ padding: '0 14px 10px', borderBottom: '1px solid var(--border)' }}>
          {sprint.goal && (
            <div style={{ fontSize: 12, color: 'var(--fg-2)', marginBottom: 8, fontStyle: 'italic' }}>
              "{sprint.goal}"
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: 3,
                background: over ? 'var(--blocked)' : 'var(--accent)',
                transition: 'width 0.2s ease',
              }} />
            </div>
            <span className="mono" style={{ fontSize: 11, color: over ? 'var(--blocked)' : 'var(--fg-2)', flexShrink: 0 }}>
              {sprintPoints} / {CAPACITY} pts
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <SprintMeta label="State" value={sprint.state} />
            <SprintMeta label="Start" value={sprint.startDate} />
            <SprintMeta label="End" value={sprint.endDate} />
            <SprintMeta label="Stories" value={String(stories.length)} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {!sprint ? (
          <Empty>Create a sprint to start planning.</Empty>
        ) : stories.length === 0 ? (
          <Empty>Drag stories here from the backlog.</Empty>
        ) : (
          stories.map(s => (
            <PlanningRow
              key={s.id}
              story={s}
              action={{ icon: <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} />, label: 'Move to backlog', onClick: () => onMoveToBacklog(s) }}
              onClick={() => onStoryClick(s.id)}
              draggable
            />
          ))
        )}
      </div>
      {sprint && (
        <ConfirmModal
          open={confirmDelete}
          title="Delete sprint"
          message={`"${sprint.name}" will be permanently deleted. Stories will move to the backlog.`}
          onConfirm={() => deleteSprint.mutate(sprint.id)}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}

function PlanningRow({ story, action, onClick, draggable }: {
  story: StoryDto
  action?: { icon: React.ReactNode; label: string; onClick: () => void }
  onClick: () => void
  draggable?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: story.id,
    disabled: !draggable,
  })

  return (
    <div
      ref={draggable ? setNodeRef : undefined}
      {...(draggable ? { ...attributes, ...listeners } : {})}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderBottom: '1px solid var(--border)',
        opacity: isDragging ? 0.3 : 1,
        cursor: draggable ? 'grab' : 'default',
        background: 'var(--bg)',
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
    >
      <StatusDot status={story.status} size={8} />
      <StoryId id={story.storyId} />

      <span
        onClick={e => { e.stopPropagation(); onClick() }}
        style={{
          flex: 1,
          fontSize: 12.5,
          color: 'var(--fg-1)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
        }}
      >
        {story.title}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        <span style={{ width: 6, height: 6, borderRadius: 1, background: story.epicColor }} title={story.epicTitle} />
        <PriorityBars priority={story.priority} />
        <Pts n={story.points} />
      </span>

      {action && (
        <button
          type="button"
          title={action.label}
          onClick={e => { e.stopPropagation(); action.onClick() }}
          style={{
            display: 'flex',
            color: 'var(--fg-3)',
            padding: 3,
            borderRadius: 3,
            flexShrink: 0,
          }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--fg-3)')}
        >
          {action.icon}
        </button>
      )}
    </div>
  )
}

function DragCard({ story }: { story: StoryDto }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 14px',
      background: 'var(--raised)',
      border: '1px solid var(--border-1)',
      borderRadius: 5,
      boxShadow: 'var(--shadow-2)',
      fontSize: 12.5, color: 'var(--fg-1)',
      maxWidth: 400, cursor: 'grabbing',
    }}>
      <StatusDot status={story.status} size={8} />
      <StoryId id={story.storyId} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {story.title}
      </span>
      <Pts n={story.points} />
    </div>
  )
}

// ── Tiny helpers ──────────────────────────────────────────────

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 14px', height: 44,
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      {children}
    </div>
  )
}

function SprintMeta({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
      <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      {' '}<span className="mono" style={{ color: 'var(--fg-2)' }}>{value}</span>
    </span>
  )
}

function ActionBtn({ icon, label, onClick, variant }: {
  icon: React.ReactNode; label: string; onClick: () => void; variant: 'accent' | 'secondary'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        height: 26, padding: '0 10px', borderRadius: 4,
        fontSize: 12, fontWeight: 600,
        background: variant === 'accent' ? 'var(--accent)' : 'var(--bg-2)',
        color: variant === 'accent' ? 'var(--accent-ink)' : 'var(--fg-1)',
        border: variant === 'accent' ? 'none' : '1px solid var(--border-1)',
      }}
    >
      {icon}{label}
    </button>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 12.5 }}>
      {children}
    </div>
  )
}

const filterSelectStyle: React.CSSProperties = {
  fontSize: 12, padding: '4px 8px',
  background: 'var(--bg-1)', border: '1px solid var(--border)',
  borderRadius: 4, color: 'var(--fg-2)',
}

const iconBtnStyle: React.CSSProperties = {
  display: 'flex', color: 'var(--fg-3)', padding: 4, borderRadius: 3,
}

// ── Hook for sprint stories ───────────────────────────────────
import { useQuery } from '@tanstack/react-query'
import { get } from '../../api/client'

function useSprintStories(projectId: string, sprintId: string | undefined) {
  return useQuery({
    queryKey: ['stories', projectId, sprintId],
    queryFn: () => get<StoryDto[]>('/stories', { projectId, sprintId }),
    enabled: !!projectId && !!sprintId,
  })
}
