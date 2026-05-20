import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { StoryDto, SprintDto } from '../types'

export function useStories(projectId: string, sprintId?: string) {
  return useQuery({
    queryKey: ['stories', projectId, sprintId],
    queryFn: () => get<StoryDto[]>('/stories', { projectId, sprintId }),
    enabled: !!projectId,
  })
}

export function useBacklog(projectId: string) {
  return useQuery({
    queryKey: ['stories', projectId, 'backlog'],
    queryFn: () => get<StoryDto[]>('/stories', { projectId, backlogOnly: true }),
    enabled: !!projectId,
  })
}

export function useSprints(projectId: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => get<SprintDto[]>('/sprints', { projectId }),
    enabled: !!projectId,
  })
}
