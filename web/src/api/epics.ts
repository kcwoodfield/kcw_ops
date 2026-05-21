import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { del, get, patch, post } from './client'
import type { EpicDto } from '../types'

export function useEpics(projectId: string) {
  return useQuery({
    queryKey: ['epics', projectId],
    queryFn: () => get<EpicDto[]>('/epics', { projectId }),
    enabled: !!projectId,
  })
}

export function useCreateEpic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { projectId: string; title: string; color: string }) =>
      post<EpicDto>('/epics', payload),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['epics', projectId] })
    },
  })
}

export function useUpdateEpic(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; title?: string; color?: string; startDate?: string | null; endDate?: string | null; clearStartDate?: boolean; clearEndDate?: boolean }) =>
      patch<EpicDto>(`/epics/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics', projectId] }),
  })
}

export function useDeleteEpic(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => del(`/epics/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['epics', projectId] })
      qc.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}
