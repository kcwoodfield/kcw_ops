import { useState } from 'react'
import { ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { get } from '../../api/client'
import { useDeleteEpic, useEpics } from '../../api/epics'
import { useUiStore } from '../../store/ui'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { CreateEpicModal } from '../CreateEpicModal'
import { ConfirmModal } from '../shared/ConfirmModal'
import { StatusDot, StoryId, PriorityBars, Pts } from '../story/StoryPrimitives'
import type { EpicDto, StoryDto } from '../../types'

export function ListView() {
  const { activeProjectId } = useUiStore()
  const { openStory } = useAppNavigate()
  const projectId = activeProjectId ?? ''
  const [editingEpic, setEditingEpic] = useState<EpicDto | undefined>()
  const [epicModalOpen, setEpicModalOpen] = useState(false)

  const { data: epics = [], isLoading: epicsLoading } = useEpics(projectId)
  const { data: stories = [], isLoading: storiesLoading } = useAllStories(projectId)

  if (epicsLoading || storiesLoading) {
    return <Centered>Loading…</Centered>
  }

  if (epics.length === 0) {
    return <Centered>No epics yet — create one to get started.</Centered>
  }

  return (
    <>
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <Th style={{ paddingLeft: 16, width: 28 }} />
              <Th>Story</Th>
              <Th style={{ width: 90 }}>Status</Th>
              <Th style={{ width: 90 }}>Priority</Th>
              <Th style={{ width: 70 }}>Points</Th>
              <Th style={{ width: 100 }}>Sprint</Th>
              <Th style={{ width: 90, paddingRight: 16 }}>Due</Th>
            </tr>
          </thead>
          <tbody>
            {epics.map(epic => {
              const epicStories = stories.filter(s => s.epicId === epic.id)
              return (
                <EpicGroup
                  key={epic.id}
                  epic={epic}
                  projectId={projectId}
                  stories={epicStories}
                  onStoryClick={openStory}
                  onEdit={ep => { setEditingEpic(ep); setEpicModalOpen(true) }}
                />
              )
            })}
          </tbody>
        </table>
      </div>
      {projectId && (
        <CreateEpicModal
          projectId={projectId}
          open={epicModalOpen}
          onClose={() => setEpicModalOpen(false)}
          epic={editingEpic}
        />
      )}
    </>
  )
}

function EpicGroup({ epic, projectId, stories, onStoryClick, onEdit }: {
  epic: EpicDto
  projectId: string
  stories: StoryDto[]
  onStoryClick: (id: string) => void
  onEdit: (epic: EpicDto) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const deleteEpic = useDeleteEpic(projectId)
  const done = stories.filter(s => s.status === 'done').length
  const total = stories.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <>
      <tr
        onClick={() => setCollapsed(c => !c)}
        style={{
          borderBottom: '1px solid var(--border)',
          background: hovered ? 'var(--hover)' : 'var(--bg-1)',
          cursor: 'pointer',
        }}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
      >
        <td style={{ paddingLeft: 16, width: 28 }}>
          <ChevronRight
            size={12}
            style={{
              color: 'var(--fg-3)',
              transform: collapsed ? 'none' : 'rotate(90deg)',
              transition: 'transform 0.15s',
            }}
          />
        </td>
        <td colSpan={5} style={{ padding: '7px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: epic.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--fg)' }}>{epic.title}</span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
              {done}/{total}
            </span>
            <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--bg-3)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: 2,
                background: pct === 100 ? 'var(--done)' : 'var(--accent)',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{pct}%</span>
            {hovered && (
              <div style={{ display: 'flex', gap: 2, marginLeft: 4 }} onClick={e => e.stopPropagation()}>
                <EpicIconBtn title="Edit" onClick={() => onEdit(epic)}><Pencil size={11} /></EpicIconBtn>
                <EpicIconBtn title="Delete" onClick={() => setConfirming(true)}><Trash2 size={11} /></EpicIconBtn>
              </div>
            )}
          </div>
        </td>
        <td style={{ paddingRight: 16, textAlign: 'right' }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
            {stories.reduce((s, st) => s + st.points, 0)} pts
          </span>
        </td>
      </tr>

      {!collapsed && stories.map(story => (
        <StoryRow key={story.id} story={story} onClick={() => onStoryClick(story.id)} />
      ))}

      {!collapsed && stories.length === 0 && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td />
          <td colSpan={6} style={{ padding: '8px 0 8px 24px', fontSize: 12, color: 'var(--fg-3)', fontStyle: 'italic' }}>
            No stories in this epic yet.
          </td>
        </tr>
      )}
      <ConfirmModal
        open={confirming}
        title="Delete epic"
        message={`"${epic.title}" and all its stories will be permanently deleted.`}
        onConfirm={() => deleteEpic.mutate(epic.id)}
        onClose={() => setConfirming(false)}
      />
    </>
  )
}

function StoryRow({ story, onClick }: { story: StoryDto; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: 'var(--bg)',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
      onMouseOut={e => (e.currentTarget.style.background = 'var(--bg)')}
    >
      <td style={{ paddingLeft: 16 }} />
      <td style={{ padding: '5px 0 5px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <StatusDot status={story.status} size={7} />
          <StoryId id={story.storyId} />
          <span style={{
            fontSize: 12.5, color: story.status === 'done' ? 'var(--fg-3)' : 'var(--fg-1)',
            textDecoration: story.status === 'done' ? 'line-through' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 380,
          }}>
            {story.title}
          </span>
          {story.blocked && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blocked)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              blocked
            </span>
          )}
        </div>
      </td>
      <td>
        <StatusChip status={story.status} />
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <PriorityBars priority={story.priority} />
          <span style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{story.priority}</span>
        </div>
      </td>
      <td><Pts n={story.points} /></td>
      <td>
        {story.sprintName ? (
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>{story.sprintName}</span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>Backlog</span>
        )}
      </td>
      <td style={{ paddingRight: 16 }}>
        {story.dueDate && (
          <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{story.dueDate}</span>
        )}
      </td>
    </tr>
  )
}

function StatusChip({ status }: { status: StoryDto['status'] }) {
  const colors = {
    todo:     { bg: 'var(--bg-2)',                border: 'var(--border-1)',    fg: 'var(--fg-3)'   },
    progress: { bg: 'rgba(90,153,196,0.12)',      border: 'rgba(90,153,196,0.3)',  fg: 'var(--progress)' },
    review:   { bg: 'rgba(196,149,58,0.12)',      border: 'rgba(196,149,58,0.3)',  fg: 'var(--review)'   },
    done:     { bg: 'rgba(91,158,110,0.12)',      border: 'rgba(91,158,110,0.3)',  fg: 'var(--done)'     },
  }
  const c = colors[status]
  const labels = { todo: 'To do', progress: 'In progress', review: 'In review', done: 'Done' }
  return (
    <span style={{
      fontSize: 11, padding: '2px 7px', borderRadius: 3,
      background: c.bg, border: `1px solid ${c.border}`, color: c.fg,
      fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      {labels[status]}
    </span>
  )
}

function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{
      textAlign: 'left', padding: '7px 8px',
      fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)',
      textTransform: 'uppercase', letterSpacing: '0.06em',
      ...style,
    }}>
      {children}
    </th>
  )
}

function EpicIconBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{ color: 'var(--fg-3)', padding: 3, borderRadius: 3, display: 'flex' }}
      onMouseOver={e => (e.currentTarget.style.color = 'var(--fg)')}
      onMouseOut={e => (e.currentTarget.style.color = 'var(--fg-3)')}
    >
      {children}
    </button>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)', fontSize: 13 }}>
      {children}
    </div>
  )
}

function useAllStories(projectId: string) {
  return useQuery({
    queryKey: ['stories', projectId, 'all'],
    queryFn: () => get<StoryDto[]>('/stories', { projectId }),
    enabled: !!projectId,
  })
}
