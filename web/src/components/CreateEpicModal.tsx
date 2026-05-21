import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useCreateEpic, useUpdateEpic } from '../api/epics'
import type { EpicDto } from '../types'

const PRESET_COLORS = [
  '#C84A40', '#C4953A', '#5B9E6E', '#5A99C4',
  '#9B6EC8', '#C86AA0', '#7A8C9E', '#B5935A',
]

interface Props {
  projectId: string
  open: boolean
  onClose: () => void
  epic?: EpicDto
}

export function CreateEpicModal({ projectId, open, onClose, epic }: Props) {
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const createEpic = useCreateEpic()
  const updateEpic = useUpdateEpic(projectId)

  useEffect(() => {
    if (open) {
      setTitle(epic?.title ?? '')
      setColor(epic?.color ?? PRESET_COLORS[0])
    }
  }, [open, epic])

  const isEditing = !!epic

  const submit = () => {
    if (!title.trim()) return
    if (isEditing) {
      updateEpic.mutate(
        { id: epic.id, title: title.trim(), color },
        { onSuccess: onClose },
      )
    } else {
      createEpic.mutate(
        { projectId, title: title.trim(), color },
        { onSuccess: () => { setTitle(''); setColor(PRESET_COLORS[0]); onClose() } },
      )
    }
  }

  const isPending = createEpic.isPending || updateEpic.isPending

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60 }} />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed', top: '20vh', left: '50%', transform: 'translateX(-50%)',
            width: 'min(420px, calc(100vw - 32px))', zIndex: 61,
            background: 'var(--panel)', border: '1px solid var(--border-1)',
            borderRadius: 8, boxShadow: 'var(--shadow-pop)', padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <Dialog.Title style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', flex: 1 }}>
              {isEditing ? 'Edit epic' : 'New epic'}
            </Dialog.Title>
            <button type="button" onClick={onClose} style={{ color: 'var(--fg-3)', display: 'flex' }}>
              <X size={14} />
            </button>
          </div>

          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Epic title…"
            style={{
              width: '100%', fontSize: 13, padding: '8px 10px',
              background: 'var(--bg-1)', border: '1px solid var(--border)',
              borderRadius: 5, color: 'var(--fg)', marginBottom: 14,
            }}
          />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Color
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  style={{ width: 22, height: 22, borderRadius: 4, background: c, border: c === color ? '2px solid var(--fg)' : '2px solid transparent' }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ fontSize: 12.5, padding: '6px 12px', borderRadius: 4, color: 'var(--fg-2)', border: '1px solid var(--border-1)' }}>
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!title.trim() || isPending}
              style={{
                fontSize: 12.5, padding: '6px 14px', borderRadius: 4,
                background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 600,
                opacity: !title.trim() ? 0.5 : 1,
              }}
            >
              {isEditing ? 'Save changes' : 'Create epic'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
