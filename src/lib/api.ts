type ApiErrorShape = {
  error?: string
  details?: unknown
}

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; details?: unknown }

const defaultBase = 'http://localhost:3000/api'

export const getApiBase = () => {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL
  return (env && env.trim().length > 0 ? env : defaultBase).replace(/\/$/, '')
}

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ems_token')
}

export async function apiFetch<T>(
  path: string,
  opts?: { method?: string; body?: unknown; token?: string | null; headers?: Record<string, string> }
): Promise<ApiResult<T>> {
  const base = getApiBase()
  const method = opts?.method ?? 'GET'
  const token = (opts?.token ?? getToken()) ?? null

  const headers: Record<string, string> = {
    ...(opts?.headers ?? {}),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  let body: string | undefined
  if (opts?.body !== undefined) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
    body = JSON.stringify(opts.body)
  }

  try {
    const res = await fetch(`${base}${path.startsWith('/') ? '' : '/'}${path}`, {
      method,
      headers,
      body,
    })

    const contentType = res.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? ((await res.json()) as unknown) : await res.text()

    if (res.ok) {
      return { ok: true, status: res.status, data: payload as T }
    }

    const msg =
      (typeof payload === 'object' && payload !== null && 'error' in payload && typeof (payload as ApiErrorShape).error === 'string'
        ? (payload as ApiErrorShape).error
        : `Request failed (${res.status})`) ?? `Request failed (${res.status})`

    const details =
      typeof payload === 'object' && payload !== null && 'details' in payload ? (payload as ApiErrorShape).details : undefined

    return { ok: false, status: res.status, error: msg, details }
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message || 'Network error' }
  }
}

