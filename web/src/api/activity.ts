import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { ActivityEventDto } from '../types'

export function useActivity(projectId: string) {
  return useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => get<ActivityEventDto[]>('/activity', { projectId }),
    enabled: !!projectId,
    refetchInterval: 30_000,
  })
}
