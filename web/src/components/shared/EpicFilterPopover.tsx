import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useDeleteEpic, useEpics } from '../../api/epics'
import type { EpicDto } from '../../types'
import { CreateEpicModal } from '../CreateEpicModal'

interface Props {
  projectId: string
  value: string       // active epicId or '' for All
  onChange: (epicId: string) => void
}

export function EpicFilterPopover({ projectId, value, onChange }: Props) {
  const { data: epics = [] } = useEpics(projectId)
  const deleteEpic = useDeleteEpic(projectId)
  const [open, setOpen] = useState(false)
  const [editingEpic, setEditingEpic] = useState<EpicDto | undefined>()
  const [epicModalOpen, setEpicModalOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const activeEpic = epics.find(e => e.id === value)
  const label = activeEpic ? activeEpic.title : 'All'

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            height: 22, padding: '0 10px', borderRadius: 3,
            background: value ? 'var(--bg-2)' : 'transparent',
            boxShadow: open || value ? '0 0 0 1px var(--border-1)' : 'none',
            color: value ? 'var(--fg)' : 'var(--fg-2)',
            fontSize: 12, fontWeight: value ? 500 : 400,
          }}
        >
          {activeEpic && (
            <span style={{ width: 7, height: 7, borderRadius: 1, background: activeEpic.color, flexShrink: 0 }} />
          )}
          <span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>Epic</span>
          <span style={{ color: 'var(--fg-2)' }}>{label}</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{epics.length}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0,
            background: 'var(--panel)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 0', minWidth: 200, zIndex: 100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
          }}>
            <EpicRow
              label="All epics"
              selected={!value}
              onSelect={() => { onChange(''); setOpen(false) }}
            />
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            {epics.map(ep => (
              <EpicRow
                key={ep.id}
                label={ep.title}
                color={ep.color}
                selected={value === ep.id}
                onSelect={() => { onChange(ep.id); setOpen(false) }}
                onEdit={() => {
                  setEditingEpic(ep)
                  setEpicModalOpen(true)
                  setOpen(false)
                }}
                onDelete={() => {
                  if (value === ep.id) onChange('')
                  deleteEpic.mutate(ep.id)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <CreateEpicModal
        projectId={projectId}
        open={epicModalOpen}
        onClose={() => { setEpicModalOpen(false); setEditingEpic(undefined) }}
        epic={editingEpic}
      />
    </>
  )
}

function EpicRow({ label, color, selected, onSelect, onEdit, onDelete }: {
  label: string
  color?: string
  selected: boolean
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center',
        background: hovered ? 'var(--hover)' : 'transparent',
        paddingRight: 6,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onSelect}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 14px', fontSize: 12.5, textAlign: 'left',
          color: selected ? 'var(--fg)' : 'var(--fg-1)',
          fontWeight: selected ? 500 : 400,
        }}
      >
        {color && <span style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />}
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {selected && <span style={{ color: 'var(--accent)', fontSize: 11 }}>✓</span>}
      </button>
      {hovered && onEdit && (
        <>
          <button type="button" onClick={onEdit}
            style={{ color: 'var(--fg-3)', padding: '3px 4px', borderRadius: 3, display: 'flex' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <Pencil size={11} />
          </button>
          <button type="button" onClick={onDelete}
            style={{ color: 'var(--fg-3)', padding: '3px 4px', borderRadius: 3, display: 'flex' }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--blocked)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          >
            <Trash2 size={11} />
          </button>
        </>
      )}
    </div>
  )
}
