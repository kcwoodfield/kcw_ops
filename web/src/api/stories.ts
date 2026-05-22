import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { del, get, patch, post } from './client'
import type {
  CreateStoryPayload,
  SprintDto,
  StoryDetailDto,
  StoryDto,
  UpdateStoryPayload,
} from '../types'

export function useCreateSprint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; name: string; goal?: string; startDate: string; endDate: string }) =>
      post<SprintDto>('/sprints', payload),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['sprints', projectId] })
    },
  })
}

export function useUpdateSprint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; goal?: string; startDate?: string; endDate?: string; state?: string }) =>
      patch<SprintDto>(`/sprints/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints'] })
      qc.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

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

export function useInboxStories() {
  return useQuery({
    queryKey: ['stories', 'inbox'],
    queryFn: () => get<StoryDto[]>('/stories', { dueSoon: true }),
  })
}

export function useMyIssues() {
  return useQuery({
    queryKey: ['stories', 'my-issues'],
    queryFn: () => get<StoryDto[]>('/stories', { assigneeId: 'kcw' }),
  })
}

export function useStarredStories() {
  return useQuery({
    queryKey: ['stories', 'starred'],
    queryFn: () => get<StoryDto[]>('/stories', { starredOnly: true }),
  })
}

export function useDraftStories() {
  return useQuery({
    queryKey: ['stories', 'drafts'],
    queryFn: () => get<StoryDto[]>('/stories', { draftsOnly: true }),
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
    onMutate: async ({ id, ...patchBody }) => {
      await qc.cancelQueries({ queryKey: ['stories'] })
      const previous = qc.getQueriesData<StoryDto[]>({ queryKey: ['stories'] })
      qc.setQueriesData<StoryDto[]>({ queryKey: ['stories'] }, old =>
        old?.map(s =>
          s.id === id
            ? {
                ...s,
                ...patchBody,
                status: patchBody.status ?? s.status,
                priority: patchBody.priority ?? s.priority,
                points: patchBody.points ?? s.points,
                blocked: patchBody.blocked ?? s.blocked,
                title: patchBody.title ?? s.title,
              }
            : s,
        ),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSuccess: (story) => {
      qc.invalidateQueries({ queryKey: ['stories'] })
      qc.invalidateQueries({ queryKey: ['sprints'] })
      qc.setQueryData(['story', story.id], story)
    },
  })
}

export function useReorderStories() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      projectId: string
      sprintId?: string
      status: string
      orderedStoryIds: string[]
    }) => post<void>('/stories/reorder', body),
    onMutate: async ({ orderedStoryIds, status }) => {
      await qc.cancelQueries({ queryKey: ['stories'] })
      const previous = qc.getQueriesData<StoryDto[]>({ queryKey: ['stories'] })
      const orderMap = new Map(orderedStoryIds.map((id, i) => [id, (i + 1) * 1000]))
      qc.setQueriesData<StoryDto[]>({ queryKey: ['stories'] }, old =>
        old?.map(s => {
          const newOrder = orderMap.get(s.id)
          if (s.status !== status || newOrder === undefined) return s
          return { ...s, sortOrder: newOrder }
        }),
      )
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['stories'] })
      qc.invalidateQueries({ queryKey: ['sprints'] })
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

export function useDeleteSprint() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/sprints/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sprints'] })
      qc.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

export function useDeleteStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/stories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories'] })
      qc.invalidateQueries({ queryKey: ['sprints'] })
    },
  })
}
