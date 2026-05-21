import { create } from 'zustand'

type Theme = 'dark' | 'light'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('kcw_theme')
  return stored === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('kcw_theme', theme)
}

interface UiState {
  activeProjectId: string | null
  activeSprintId: string | null
  cmdPaletteOpen: boolean
  theme: Theme
  sidebarCollapsed: boolean
  setActiveProject: (projectId: string) => void
  setActiveSprint: (sprintId: string) => void
  setCmdPaletteOpen: (open: boolean) => void
  toggleTheme: () => void
  toggleSidebar: () => void
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useUiStore = create<UiState>((set) => ({
  activeProjectId: null,
  activeSprintId: null,
  cmdPaletteOpen: false,
  theme: initialTheme,
  sidebarCollapsed: false,
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setActiveSprint: (sprintId) => set({ activeSprintId: sprintId }),
  setCmdPaletteOpen: (open) => set({ cmdPaletteOpen: open }),
  toggleTheme: () => set(s => {
    const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    return { theme: next }
  }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
