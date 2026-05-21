import { useQuery } from '@tanstack/react-query'
import { get } from './client'
import type { UserDto } from '../types'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => get<UserDto[]>('/users'),
    staleTime: Infinity,
  })
}
