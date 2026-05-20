import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { EpicDto } from '../types'

export function useEpics(projectId: string) {
  return useQuery({
    queryKey: ['epics', projectId],
    queryFn: () => get<EpicDto[]>('/epics', { projectId }),
    enabled: !!projectId,
  })
}
