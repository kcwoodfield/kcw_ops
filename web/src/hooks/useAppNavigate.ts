import { useCallback } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { AppView } from '../lib/routes'
import { LAST_PROJECT_KEY, projectPath, parseSearchParams, isAppView } from '../lib/routes'

export function useProjectKey() {
  return useParams().projectKey?.toUpperCase()
}

export function useAppView(): AppView {
  const { pathname } = useLocation()
  const match = pathname.match(/\/p\/[^/]+\/([^/?]+)/)
  return isAppView(match?.[1]) ? match![1] : 'board'
}

export function useAppNavigate() {
  const navigate = useNavigate()
  const projectKey = useProjectKey()
  const view = useAppView()
  const [searchParams, setSearchParams] = useSearchParams()
  const { sprintId, storyId } = parseSearchParams(searchParams)

  const goToProject = useCallback(
    (key: string, nextView: AppView = view, opts?: { sprint?: string | null; story?: string | null }) => {
      localStorage.setItem(LAST_PROJECT_KEY, key)
      // Sprint and story belong to a specific project — drop them when crossing
      // a project boundary so we don't render Minerva's sprint under Histomap.
      const samePage = key.toUpperCase() === projectKey
      navigate(projectPath(key, nextView, {
        sprint: opts?.sprint !== undefined ? opts.sprint : (samePage ? sprintId : null),
        story:  opts?.story  !== undefined ? opts.story  : (samePage ? storyId  : null),
      }))
    },
    [navigate, view, projectKey, sprintId, storyId],
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
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      p.delete('story')
      return p
    }, { replace: true })
  }, [setSearchParams])

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
