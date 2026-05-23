import { createContext, useContext } from 'react'

interface AuthFadeContextValue {
  crossFade: (between: () => void | Promise<void>) => Promise<void>
}

export const AuthFadeContext = createContext<AuthFadeContextValue>({
  crossFade: async (between) => { await between() },
})

export const useAuthFade = () => useContext(AuthFadeContext)
