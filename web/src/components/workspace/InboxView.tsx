import { useInboxStories } from '../../api/stories'
import { CrossProjectView } from './CrossProjectView'

export function InboxView() {
  const { data: stories = [], isLoading } = useInboxStories()
  return (
    <CrossProjectView
      stories={stories}
      isLoading={isLoading}
      emptyText="Nothing due — you're all caught up."
      groupBy="urgency"
    />
  )
}
