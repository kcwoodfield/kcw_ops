import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { ProgramDto } from '../types'

export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => get<ProgramDto[]>('/programs'),
  })
}
