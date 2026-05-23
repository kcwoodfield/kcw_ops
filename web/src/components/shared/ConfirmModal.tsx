import * as Dialog from '@radix-ui/react-dialog'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  danger?: boolean
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose, danger = true }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 70 }} />
        <Dialog.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed', top: '28vh', left: '50%', transform: 'translateX(-50%)',
            width: 'min(380px, calc(100vw - 32px))', zIndex: 71,
            background: 'var(--panel)', border: '1px solid var(--border-1)',
            borderRadius: 8, boxShadow: 'var(--shadow-pop)', padding: 20,
          }}
        >
          <Dialog.Title style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginBottom: 8 }}>
            {title}
          </Dialog.Title>
          <p style={{ fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 20 }}>
            {message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ fontSize: 14.5, padding: '6px 14px', borderRadius: 4, color: 'var(--fg-2)', border: '1px solid var(--border-1)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { onConfirm(); onClose() }}
              style={{
                fontSize: 14.5, padding: '6px 14px', borderRadius: 4, fontWeight: 600,
                background: danger ? 'var(--blocked)' : 'var(--accent)',
                color: 'var(--accent-ink)',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
