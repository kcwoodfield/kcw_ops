import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useEpics } from '../../api/epics'
import { useCreateStory } from '../../api/stories'
import { useAppNavigate } from '../../hooks/useAppNavigate'
import { useUiStore } from '../../store/ui'
import { CreateEpicModal } from '../CreateEpicModal'
import { CreateSprintModal } from '../CreateSprintModal'

export function ActionBar() {
  const { sprintId, openStory } = useAppNavigate()
  const { activeProjectId } = useUiStore()
  const [epicModalOpen, setEpicModalOpen] = useState(false)
  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const { data: epics = [] } = useEpics(activeProjectId ?? '')
  const createStory = useCreateStory()

  const handleNewIssue = async () => {
    if (!activeProjectId || epics.length === 0) return
    const story = await createStory.mutateAsync({
      projectId: activeProjectId,
      epicId: epics[0].id,
      title: 'New issue',
      sprintId: sprintId ?? undefined,
    })
    openStory(story.id)
  }

  return (
    <div style={{
      height: 44,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 14px',
      background: 'var(--panel)',
      borderBottom: '1px solid var(--border)',
      minWidth: 0,
    }}>
      <div style={{ flex: 1 }} />

      {activeProjectId && (
        <>
          <button type="button" onClick={() => setEpicModalOpen(true)} style={secondaryBtnStyle}>
            <Plus size={12} /> Epic
          </button>
          <button type="button" onClick={() => setSprintModalOpen(true)} style={secondaryBtnStyle}>
            <Plus size={12} /> Sprint
          </button>
        </>
      )}

      <button
        type="button"
        disabled={!activeProjectId || epics.length === 0 || createStory.isPending}
        onClick={() => void handleNewIssue()}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 28, padding: '0 10px',
          background: 'var(--accent)', color: 'var(--accent-ink)',
          borderRadius: 'var(--r-sm)',
          fontSize: 12, fontWeight: 600,
          flexShrink: 0,
          opacity: !activeProjectId || epics.length === 0 ? 0.5 : 1,
        }}
      >
        <Plus size={12} />
        New issue
        <span className="kbd" style={{ marginLeft: 2, background: 'rgba(0,0,0,0.15)', borderColor: 'rgba(0,0,0,0.2)', color: 'var(--accent-ink)' }}>C</span>
      </button>

      {activeProjectId && (
        <>
          <CreateEpicModal projectId={activeProjectId} open={epicModalOpen} onClose={() => setEpicModalOpen(false)} />
          <CreateSprintModal projectId={activeProjectId} open={sprintModalOpen} onClose={() => setSprintModalOpen(false)} />
        </>
      )}
    </div>
  )
}

const secondaryBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 28, padding: '0 10px',
  background: 'var(--accent-bg)', border: '1px solid var(--accent-line)',
  borderRadius: 'var(--r-sm)', fontSize: 12, fontWeight: 500,
  color: 'var(--accent-fg)', flexShrink: 0,
}
