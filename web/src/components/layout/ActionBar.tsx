import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useUiStore } from '../../store/ui'
import { CreateEpicModal } from '../CreateEpicModal'
import { CreateSprintModal } from '../CreateSprintModal'

export function ActionBar() {
  const { activeProjectId } = useUiStore()
  const [epicModalOpen, setEpicModalOpen] = useState(false)
  const [sprintModalOpen, setSprintModalOpen] = useState(false)

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
          <button type="button" onClick={() => setEpicModalOpen(true)} style={ghostBtnStyle}>
            <Plus size={11} /> Epic
          </button>
          <button type="button" onClick={() => setSprintModalOpen(true)} style={ghostBtnStyle}>
            <Plus size={11} /> Sprint
          </button>
          <CreateEpicModal projectId={activeProjectId} open={epicModalOpen} onClose={() => setEpicModalOpen(false)} />
          <CreateSprintModal projectId={activeProjectId} open={sprintModalOpen} onClose={() => setSprintModalOpen(false)} />
        </>
      )}
    </div>
  )
}

const ghostBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  height: 26, padding: '0 9px',
  background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 'var(--r-sm)', fontSize: 11.5, fontWeight: 500,
  color: 'var(--fg-3)', flexShrink: 0,
}
