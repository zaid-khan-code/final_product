import { apiFetch } from '@/lib/api'

export class ApiMutationError extends Error {
  status: number
  details?: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiMutationError'
    this.status = status
    this.details = details
  }
}

export async function mutateJson<T>(
  path: string,
  opts?: { method?: string; body?: unknown; headers?: Record<string, string> }
) {
  const result = await apiFetch<T>(path, opts)

  if (!result.ok) {
    throw new ApiMutationError(result.error, result.status, result.details)
  }

  return result.data
}
