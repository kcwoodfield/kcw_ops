import { useMyIssues } from '../../api/stories'
import { CrossProjectView } from './CrossProjectView'

export function MyIssuesView() {
  const { data: stories = [], isLoading } = useMyIssues()
  return (
    <CrossProjectView
      stories={stories}
      isLoading={isLoading}
      emptyText="No issues assigned to you."
    />
  )
}
