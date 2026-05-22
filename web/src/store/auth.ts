import { create } from 'zustand'
import { setAccessToken } from '../api/client'
import { apiLogout, apiRefresh } from '../api/auth'

interface AuthState {
  ready: boolean        // initial refresh attempt complete
  authed: boolean       // has valid access token
  bootstrap: () => Promise<void>
  login: (token: string) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  ready: false,
  authed: false,

  bootstrap: async () => {
    const data = await apiRefresh()
    if (data?.accessToken) {
      setAccessToken(data.accessToken)
      set({ ready: true, authed: true })
    } else {
      setAccessToken(null)
      set({ ready: true, authed: false })
    }
  },

  login: (token: string) => {
    setAccessToken(token)
    set({ authed: true })
  },

  logout: async () => {
    await apiLogout()
    setAccessToken(null)
    set({ authed: false })
  },
}))
