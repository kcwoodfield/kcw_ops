/** URL path segments for primary app surfaces */
export type AppView =
  | 'board'
  | 'backlog'
  | 'planning'
  | 'list'
  | 'roadmap'
  | 'activity'

export const APP_VIEWS: AppView[] = [
  'board',
  'backlog',
  'planning',
  'list',
  'roadmap',
  'activity',
]

export const LAST_PROJECT_KEY = 'kcw_last_project_key'

export function isAppView(segment: string | undefined): segment is AppView {
  return APP_VIEWS.includes(segment as AppView)
}

export function projectPath(
  projectKey: string,
  view: AppView = 'board',
  search?: { sprint?: string | null; story?: string | null },
): string {
  const path = `/p/${projectKey}/${view}`
  if (!search) return path
  const params = new URLSearchParams()
  if (search.sprint) params.set('sprint', search.sprint)
  if (search.story) params.set('story', search.story)
  const q = params.toString()
  return q ? `${path}?${q}` : path
}

export function parseSearchParams(search: URLSearchParams) {
  return {
    sprintId: search.get('sprint'),
    storyId: search.get('story'),
  }
}
