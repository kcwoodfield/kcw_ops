import { useCallback } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { AppView } from '../lib/routes'
import { LAST_PROJECT_KEY, projectPath, parseSearchParams } from '../lib/routes'

export function useProjectKey() {
  return useParams().projectKey?.toUpperCase()
}

export function useAppView(): AppView {
  const { pathname } = useLocation()
  const match = pathname.match(/\/p\/[^/]+\/([^/?]+)/)
  const segment = match?.[1]
  if (
    segment === 'board' ||
    segment === 'backlog' ||
    segment === 'planning' ||
    segment === 'list' ||
    segment === 'calendar' ||
    segment === 'activity'
  ) {
    return segment
  }
  return 'board'
}

export function useAppNavigate() {
  const navigate = useNavigate()
  const projectKey = useProjectKey()
  const view = useAppView()
  const [searchParams] = useSearchParams()
  const { sprintId, storyId } = parseSearchParams(searchParams)

  const goToProject = useCallback(
    (key: string, nextView: AppView = view, opts?: { sprint?: string | null; story?: string | null }) => {
      localStorage.setItem(LAST_PROJECT_KEY, key)
      navigate(projectPath(key, nextView, {
        sprint: opts?.sprint !== undefined ? opts.sprint : sprintId,
        story: opts?.story !== undefined ? opts.story : storyId,
      }))
    },
    [navigate, view, sprintId, storyId],
  )

  const goToView = useCallback(
    (nextView: AppView) => {
      if (!projectKey) return
      navigate(projectPath(projectKey, nextView, { sprint: sprintId, story: storyId }))
    },
    [navigate, projectKey, sprintId, storyId],
  )

  const setSprint = useCallback(
    (sprint: string | null) => {
      if (!projectKey) return
      navigate(projectPath(projectKey, view, { sprint, story: storyId }))
    },
    [navigate, projectKey, view, storyId],
  )

  const openStory = useCallback(
    (id: string) => {
      if (!projectKey) return
      navigate(projectPath(projectKey, view, { sprint: sprintId, story: id }))
    },
    [navigate, projectKey, view, sprintId],
  )

  const closeStory = useCallback(() => {
    if (!projectKey) return
    navigate(projectPath(projectKey, view, { sprint: sprintId, story: null }))
  }, [navigate, projectKey, view, sprintId])

  return {
    projectKey,
    view,
    sprintId,
    storyId,
    goToProject,
    goToView,
    setSprint,
    openStory,
    closeStory,
  }
}
