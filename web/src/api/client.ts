const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:5050') + '/api'

// ── Token store (in-memory only — not localStorage) ──────────────────────────
let accessToken: string | null = null

export function setAccessToken(token: string | null) { accessToken = token }
export function getAccessToken() { return accessToken }

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

// ── Core fetch — handles auth, silent refresh on 401, and error normalization
async function coreFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const doFetch = () => fetch(url, {
    credentials: 'include',
    ...init,
    headers: { ...authHeaders(), ...init?.headers },
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error ?? `${res.status} ${res.statusText}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Public verbs ─────────────────────────────────────────────────────────────
export function get<T>(path: string, params?: Record<string, string | boolean | undefined>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return coreFetch<T>(url.toString())
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return coreFetch<T>(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return coreFetch<T>(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function del(path: string): Promise<void> {
  return coreFetch<void>(`${BASE}${path}`, { method: 'DELETE' })
}
