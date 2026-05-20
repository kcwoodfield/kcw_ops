import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { ProjectDto } from '../types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => get<ProjectDto[]>('/projects'),
  })
}
