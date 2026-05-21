import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { get, post } from './client'
import type { CommentDto } from '../types'

export function useComments(storyId: string | null) {
  return useQuery({
    queryKey: ['comments', storyId],
    queryFn: () => get<CommentDto[]>(`/stories/${storyId}/comments`),
    enabled: !!storyId,
  })
}

export function useAddComment(storyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { authorId: string; body: string }) =>
      post<CommentDto>(`/stories/${storyId}/comments`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', storyId] })
      qc.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}
