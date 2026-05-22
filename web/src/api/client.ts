const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050') + '/api'

// ── Token store (in-memory only — not localStorage) ──────────────────────────
let accessToken: string | null = null

export function setAccessToken(token: string | null) { accessToken = token }
export function getAccessToken() { return accessToken }

// ── Auth header helper ────────────────────────────────────────────────────────
function authHeaders(): Record<string, string> {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
}

// ── Silent refresh on 401 ────────────────────────────────────────────────────
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE.replace('/api', '')}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) { accessToken = null; return false }
      const data = await res.json() as { accessToken: string }
      accessToken = data.accessToken
      return true
    } catch {
      accessToken = null
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const doFetch = () => fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...init?.headers },
    ...init,
  })

  let res = await doFetch()

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (!refreshed) {
      // Signal auth store to redirect to /login
      window.dispatchEvent(new CustomEvent('auth:logout'))
      throw new Error('401')
    }
    res = await doFetch()
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error ?? `${res.status} ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function get<T>(path: string, params?: Record<string, string | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }

  const doFetch = () => fetch(url.toString(), {
    credentials: 'include',
    headers: { ...authHeaders() },
  })

  let res = await doFetch()

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (!refreshed) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
      throw new Error('401')
    }
    res = await doFetch()
  }

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) })
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
}

export function del(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' })
}
