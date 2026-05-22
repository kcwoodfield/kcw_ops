const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050')

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Invalid credentials.')
  return res.json() as Promise<{ requiresMfa: boolean; tempToken: string }>
}

export async function apiVerify(tempToken: string, totpCode: string) {
  const res = await fetch(`${BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tempToken, totpCode }),
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Invalid or expired code.')
  return res.json() as Promise<{ accessToken: string }>
}

export async function apiRefresh() {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json() as Promise<{ accessToken: string }>
}

export async function apiLogout() {
  await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
}

export async function apiSetup(password: string) {
  const res = await fetch(`${BASE}/auth/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) throw new Error('Setup failed or not available.')
  return res.json() as Promise<{ passwordHash: string; totpSecret: string; totpUri: string }>
}
