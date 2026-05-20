export interface ProjectDto {
  id: string
  name: string
  key: string
  color: string
}

export interface ProgramDto {
  id: string
  name: string
  projects: ProjectDto[]
}

export interface SprintDto {
  id: string
  name: string
  goal: string | null
  startDate: string
  endDate: string
  state: 'planned' | 'active' | 'completed'
  committedPoints: number
  completedPoints: number
}

export interface StoryDto {
  id: string
  storyId: string
  title: string
  status: 'todo' | 'progress' | 'review' | 'done'
  priority: 'urgent' | 'high' | 'med' | 'low'
  points: number
  blocked: boolean
  epicId: string
  epicTitle: string
  epicColor: string
  sprintId: string | null
  sprintName: string | null
  labels: string[]
  dueDate: string | null
  assigneeId: string | null
}

export type View = 'kanban' | 'list' | 'calendar'
