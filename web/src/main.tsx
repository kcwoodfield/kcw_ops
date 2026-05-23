import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/auth.ts'
import { injectFadeStyles } from './lib/fade-transitions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => {
        if (error instanceof Error && error.message === '401') return false
        return count < 1
      },
    },
  },
})

function Root() {
  const bootstrap = useAuthStore(s => s.bootstrap)
  useEffect(() => { injectFadeStyles(); void bootstrap() }, [bootstrap])
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
