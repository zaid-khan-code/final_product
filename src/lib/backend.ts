import { cookies } from 'next/headers'
import { getBackendApiUrl, getCookieNames } from '@/lib/auth'

type ServerFetchOptions = Omit<RequestInit, 'cache' | 'next'> & {
  next?: RequestInit['next']
  cache?: RequestCache
}

const buildBackendUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getBackendApiUrl()}${normalizedPath}`
}

const getAuthorizedHeaders = async (headers?: HeadersInit) => {
  const requestHeaders = new Headers(headers)
  const cookieStore = await cookies()
  const token = cookieStore.get(getCookieNames().jwt)?.value

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  return requestHeaders
}

export const serverFetchBackend = async (path: string, init: ServerFetchOptions = {}) => {
  const headers = await getAuthorizedHeaders(init.headers)

  return fetch(buildBackendUrl(path), {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  })
}

export const serverFetchBackendJson = async <T>(path: string, init: ServerFetchOptions = {}) => {
  const response = await serverFetchBackend(path, init)
  const payload = (await response.json()) as T
  return { response, payload }
}

export const fetchOrgAggregate = async (
  path: string,
  revalidateSeconds: number,
  init: Omit<ServerFetchOptions, 'cache' | 'next'> = {}
) => {
  if (!Number.isInteger(revalidateSeconds) || revalidateSeconds <= 0) {
    throw new Error('fetchOrgAggregate requires a positive integer revalidate value.')
  }

  const headers = await getAuthorizedHeaders(init.headers)

  return fetch(buildBackendUrl(path), {
    ...init,
    headers,
    cache: 'force-cache',
    next: { revalidate: revalidateSeconds },
  })
}
