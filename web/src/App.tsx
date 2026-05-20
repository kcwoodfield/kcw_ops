import { AppShell } from './components/layout/AppShell'
import { Kanban } from './components/kanban/Kanban'
import { StoryDrawer } from './components/story/StoryDrawer'
import { useUiStore } from './store/ui'

function ViewPlaceholder({ name }: { name: string }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--fg-2)',
        fontSize: 13,
      }}
    >
      {name} — coming soon
    </div>
  )
}

function MainView() {
  const view = useUiStore(s => s.view)

  switch (view) {
    case 'kanban':
      return <Kanban />
    case 'list':
      return <ViewPlaceholder name="List view" />
    case 'calendar':
      return <ViewPlaceholder name="Calendar" />
  }
}

export default function App() {
  return (
    <>
      <AppShell>
        <MainView />
      </AppShell>
      <StoryDrawer />
    </>
  )
}
