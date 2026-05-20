import { create } from 'zustand'

interface UiState {
  activeProjectId: string | null
  activeSprintId: string | null
  cmdPaletteOpen: boolean
  setActiveProject: (projectId: string) => void
  setActiveSprint: (sprintId: string) => void
  setCmdPaletteOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeProjectId: null,
  activeSprintId: null,
  cmdPaletteOpen: false,
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setActiveSprint: (sprintId) => set({ activeSprintId: sprintId }),
  setCmdPaletteOpen: (open) => set({ cmdPaletteOpen: open }),
}))
