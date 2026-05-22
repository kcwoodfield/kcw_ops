import { Bot } from 'lucide-react'
import { useUiStore } from '../../store/ui'
import { useIsCompact } from '../../hooks/useMediaQuery'

export function Footer() {
  const { toggleLoboPanel, sidebarCollapsed } = useUiStore()
  const compact = useIsCompact()

  const left = compact ? 0 : sidebarCollapsed ? 52 : 232

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left,
      right: 0,
      height: 52,
      zIndex: 40,
      background: 'var(--panel)',
      borderTop: '1px solid var(--border)',
      transition: 'left 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 16px',
    }}>
      <button
        type="button"
        onClick={toggleLoboPanel}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          height: 34, padding: '0 16px',
          background: 'var(--accent)',
          border: 'none',
          borderRadius: 'var(--r-sm)',
          fontSize: 12, fontWeight: 600,
          color: 'var(--accent-ink)',
          letterSpacing: '0.01em',
          transition: 'opacity 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.opacity = '0.85' }}
        onMouseOut={e => { e.currentTarget.style.opacity = '1' }}
      >
        <Bot size={15} />
        Lobo
      </button>
    </div>
  )
}
