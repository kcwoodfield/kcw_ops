import { useStarredStories } from '../../api/stories'
import { CrossProjectView } from './CrossProjectView'

export function StarredView() {
  const { data: stories = [], isLoading } = useStarredStories()
  return (
    <CrossProjectView
      stories={stories}
      isLoading={isLoading}
      emptyText="No starred stories yet — star a story to pin it here."
    />
  )
}
