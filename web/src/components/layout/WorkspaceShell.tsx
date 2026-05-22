import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useUiStore } from '../../store/ui'
import { useIsCompact } from '../../hooks/useMediaQuery'
import { LoboPanel } from '../lobo/LoboPanel'
import { Footer } from './Footer'

export function WorkspaceShell({ title }: { title: string }) {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore()
  const compact = useIsCompact()
  const { pathname } = useLocation()

  useEffect(() => { setMobileSidebarOpen(false) }, [pathname, setMobileSidebarOpen])
  useEffect(() => { if (!compact) setMobileSidebarOpen(false) }, [compact, setMobileSidebarOpen])

  return (
    <div style={{
      width: '100%', height: '100vh',
      display: 'grid',
      gridTemplateColumns: compact ? '1fr' : sidebarCollapsed ? '52px 1fr' : '232px 1fr',
      gridTemplateRows: '44px 44px 1fr',
      background: 'var(--bg)', color: 'var(--fg)', overflow: 'hidden',
    }}>
      <Sidebar compact={compact} />
      <TopBar />
      <div style={{
        height: 44,
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 10,
        background: 'var(--panel)',
        borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{title}</span>
      </div>
      <main style={{ background: 'var(--bg)', overflow: 'hidden', position: 'relative', paddingBottom: 40 }}>
        <Outlet />
      </main>

      <Footer />

      {compact && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 19 }}
        />
      )}
      <LoboPanel />
    </div>
  )
}
