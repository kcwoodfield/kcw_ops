import { create } from 'zustand'

interface UiState {
  activeProjectId: string | null
  activeSprintId: string | null
  setActiveProject: (projectId: string) => void
  setActiveSprint: (sprintId: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeProjectId: null,
  activeSprintId: null,
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setActiveSprint: (sprintId) => set({ activeSprintId: sprintId }),
}))
