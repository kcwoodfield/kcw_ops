import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, authed, logout } = useAuthStore()

  // Listen for 401 events dispatched by the API client
  useEffect(() => {
    const handler = () => void logout()
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [logout])

  if (!ready) return null

  if (!authed) return <Navigate to="/login" replace />

  return <>{children}</>
}
