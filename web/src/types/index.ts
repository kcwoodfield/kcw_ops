export interface ProjectDto {
  id: string
  name: string
  key: string
  color: string
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

export type StoryStatus = 'todo' | 'progress' | 'review' | 'done'
export type StoryPriority = 'urgent' | 'high' | 'med' | 'low'

export interface StoryDto {
  id: string
  storyId: string
  title: string
  status: StoryStatus
  priority: StoryPriority
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
  sortOrder: number
}

export interface StoryDetailDto extends StoryDto {
  projectId: string
  projectKey: string
  description: string | null
  sprintState: string | null
}

export interface EpicDto {
  id: string
  title: string
  color: string
  totalPoints: number
  donePoints: number
}

export interface UpdateStoryPayload {
  title?: string
  description?: string
  status?: StoryStatus
  priority?: StoryPriority
  points?: number
  blocked?: boolean
  epicId?: string
  sprintId?: string
  clearSprint?: boolean
  dueDate?: string | null
  labels?: string[]
}

export interface CreateStoryPayload {
  projectId: string
  epicId: string
  title: string
  sprintId?: string
  status?: StoryStatus
  priority?: StoryPriority
  points?: number
}

export const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13, 21] as const

export const STATUS_LABELS: Record<StoryStatus, string> = {
  todo: 'To do',
  progress: 'In progress',
  review: 'In review',
  done: 'Done',
}

export const PRIORITY_LABELS: Record<StoryPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  med: 'Medium',
  low: 'Low',
}

/** @deprecated Use AppView from lib/routes — URL segments: board, list, calendar, etc. */
export type View = 'kanban' | 'list' | 'calendar'
