import { useDraftStories } from '../../api/stories'
import { CrossProjectView } from './CrossProjectView'

export function DraftsView() {
  const { data: stories = [], isLoading } = useDraftStories()
  return (
    <CrossProjectView
      stories={stories}
      isLoading={isLoading}
      emptyText="No drafts — backlog stories without a description appear here."
    />
  )
}
