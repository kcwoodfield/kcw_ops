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

export type LoboModel = 'claude-sonnet' | 'claude-haiku' | 'ollama'

interface UiState {
  activeProjectId: string | null
  activeSprintId: string | null
  cmdPaletteOpen: boolean
  theme: Theme
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  loboPanelOpen: boolean
  loboModel: LoboModel
  setActiveProject: (projectId: string) => void
  setActiveSprint: (sprintId: string) => void
  setCmdPaletteOpen: (open: boolean) => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
  toggleLoboPanel: () => void
  setLoboModel: (model: LoboModel) => void
}

const initialTheme = getInitialTheme()
applyTheme(initialTheme)

const storedLoboModel = (localStorage.getItem('kcw_lobo_model') ?? 'claude-sonnet') as LoboModel

export const useUiStore = create<UiState>((set) => ({
  activeProjectId: null,
  activeSprintId: null,
  cmdPaletteOpen: false,
  theme: initialTheme,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  loboPanelOpen: false,
  loboModel: storedLoboModel,
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setActiveSprint: (sprintId) => set({ activeSprintId: sprintId }),
  setCmdPaletteOpen: (open) => set({ cmdPaletteOpen: open }),
  toggleTheme: () => set(s => {
    const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    return { theme: next }
  }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleLoboPanel: () => set(s => ({ loboPanelOpen: !s.loboPanelOpen })),
  setLoboModel: (model) => {
    localStorage.setItem('kcw_lobo_model', model)
    set({ loboModel: model })
  },
}))
