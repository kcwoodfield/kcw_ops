import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, post } from './client'
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
