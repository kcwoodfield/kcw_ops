import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useCreateSprint } from '../api/stories'

interface Props {
  projectId: string
  open: boolean
  onClose: () => void
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function twoWeeksStr() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

export function CreateSprintModal({ projectId, open, onClose }: Props) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(twoWeeksStr)
  const createSprint = useCreateSprint()

  const submit = () => {
    if (!name.trim()) return
    createSprint.mutate(
      { projectId, name: name.trim(), goal: goal.trim() || undefined, startDate, endDate },
      { onSuccess: () => { setName(''); setGoal(''); onClose() } },
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60 }} />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed', top: '20vh', left: '50%', transform: 'translateX(-50%)',
            width: 'min(460px, calc(100vw - 32px))', zIndex: 61,
            background: 'var(--panel)', border: '1px solid var(--border-1)',
            borderRadius: 8, boxShadow: 'var(--shadow-pop)', padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <Dialog.Title style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)', flex: 1 }}>
              New sprint
            </Dialog.Title>
            <button type="button" onClick={onClose} style={{ color: 'var(--fg-3)', display: 'flex' }}>
              <X size={14} />
            </button>
          </div>

          <Field label="Sprint name">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="e.g. Sprint 1"
              style={inputStyle}
            />
          </Field>

          <Field label="Goal (optional)">
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="What are we shipping?"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <Field label="Start date">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
            <Field label="End date">
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ fontSize: 12.5, padding: '6px 12px', borderRadius: 4, color: 'var(--fg-2)', border: '1px solid var(--border-1)' }}>
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!name.trim() || createSprint.isPending}
              style={{
                fontSize: 12.5, padding: '6px 14px', borderRadius: 4,
                background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 600,
                opacity: !name.trim() ? 0.5 : 1,
              }}
            >
              Create sprint
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', fontSize: 13, padding: '7px 10px',
  background: 'var(--bg-1)', border: '1px solid var(--border)',
  borderRadius: 5, color: 'var(--fg)',
}
