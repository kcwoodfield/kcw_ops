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
      height: 40,
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
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 13, fontWeight: 500,
          color: 'var(--fg-1)',
          letterSpacing: '0.01em',
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'var(--hover)'
          e.currentTarget.style.borderColor = 'var(--border-1)'
          e.currentTarget.style.color = 'var(--fg)'
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'var(--bg-1)'
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--fg-1)'
        }}
      >
        <Bot size={15} />
        Lobo
      </button>
    </div>
  )
}
