import { create } from 'zustand'
import type { View } from '../types'

interface UiState {
  activeProjectId: string | null
  activeSprintId: string | null
  view: View
  storyDrawerId: string | null
  setActiveProject: (projectId: string) => void
  setActiveSprint: (sprintId: string) => void
  setView: (view: View) => void
  openStoryDrawer: (storyId: string) => void
  closeStoryDrawer: () => void
}

export const useUiStore = create<UiState>((set) => ({
  activeProjectId: null,
  activeSprintId: null,
  view: 'kanban',
  storyDrawerId: null,
  setActiveProject: (projectId) =>
    set({ activeProjectId: projectId, activeSprintId: null, storyDrawerId: null }),
  setActiveSprint: (sprintId) => set({ activeSprintId: sprintId }),
  setView: (view) => set({ view }),
  openStoryDrawer: (storyId) => set({ storyDrawerId: storyId }),
  closeStoryDrawer: () => set({ storyDrawerId: null }),
}))
