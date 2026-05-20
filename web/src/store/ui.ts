import { create } from 'zustand'
import type { View } from '../types'

interface UiState {
  activeProjectId: string | null
  activeSprintId: string | null
  view: View
  setActiveProject: (projectId: string) => void
  setActiveSprint: (sprintId: string) => void
  setView: (view: View) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeProjectId: null,
  activeSprintId: null,
  view: 'kanban',
  setActiveProject: (projectId) => set({ activeProjectId: projectId, activeSprintId: null }),
  setActiveSprint: (sprintId) => set({ activeSprintId: sprintId }),
  setView: (view) => set({ view }),
}))
