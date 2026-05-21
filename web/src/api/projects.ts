import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, post } from './client'
import type { ProjectDto } from '../types'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => get<ProjectDto[]>('/projects'),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; key: string; color: string }) =>
      post<ProjectDto>('/projects', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  })
}
