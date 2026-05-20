import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, patch, post } from './client'
import type {
  CreateStoryPayload,
  SprintDto,
  StoryDetailDto,
  StoryDto,
  UpdateStoryPayload,
} from '../types'

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

export function useStory(storyId: string | null) {
  return useQuery({
    queryKey: ['story', storyId],
    queryFn: () => get<StoryDetailDto>(`/stories/${storyId}`),
    enabled: !!storyId,
  })
}

export function useUpdateStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateStoryPayload & { id: string }) =>
      patch<StoryDetailDto>(`/stories/${id}`, body),
    onSuccess: (story) => {
      qc.invalidateQueries({ queryKey: ['stories'] })
      qc.invalidateQueries({ queryKey: ['sprints'] })
      qc.setQueryData(['story', story.id], story)
    },
  })
}

export function useCreateStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateStoryPayload) => post<StoryDetailDto>('/stories', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories'] })
      qc.invalidateQueries({ queryKey: ['sprints'] })
    },
  })
}
