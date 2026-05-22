import { useEffect, useRef, useState } from 'react'
import { Bot, Moon, Sun, UserCircle } from 'lucide-react'
import { useUiStore } from '../../store/ui'
import { useAuthStore } from '../../store/auth'
import { useAuthFade } from '../../context/auth-fade'
import { useIsCompact } from '../../hooks/useMediaQuery'

export function Footer() {
  const { toggleLoboPanel, sidebarCollapsed, theme, toggleTheme } = useUiStore()
  const { logout } = useAuthStore()
  const { crossFade } = useAuthFade()
  const compact = useIsCompact()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const left = compact ? 0 : sidebarCollapsed ? 52 : 232

  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

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
      justifyContent: 'space-between',
      padding: '0 16px',
    }}>
      {/* Left: Profile */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setProfileOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 34, padding: '0 14px',
            background: 'transparent',
            border: '1px solid transparent',
            borderRadius: 8,
            fontSize: 13, fontWeight: 500,
            color: 'var(--fg-2)',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'var(--hover)'
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.color = 'var(--fg-2)'
          }}
        >
          <UserCircle size={16} />
          Profile
        </button>

        {profileOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '4px 0',
            minWidth: 180,
            zIndex: 200,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
          }}>
            <button
              type="button"
              onClick={() => { toggleTheme(); setProfileOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 12.5, color: 'var(--fg-1)',
                background: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button
              type="button"
              onClick={() => { setProfileOpen(false); void crossFade(() => void logout()) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', textAlign: 'left',
                padding: '8px 14px', fontSize: 12.5, color: 'var(--fg-danger, #f87171)',
                background: 'transparent',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Right: Lobo */}
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
