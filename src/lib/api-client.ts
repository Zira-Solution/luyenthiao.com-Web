import { env } from '@/lib/env'
import { useAuthStore } from '@/store/auth-store'
import type { AuthResponse } from '@/types/auth'

export const GENERIC_ERROR_MESSAGE = 'Không thể kết nối máy chủ, vui lòng thử lại sau.'

/**
 * `fromApi` is true only when the backend itself produced the error (NestJS shape, status < 500): then `message` is
 * safe to show. Anything else — HTML from a proxy, Nest's default 500 body, an empty body, a network failure — gets
 * the generic message and never the raw body (spec 2026-11-18-web-security-foundation §5).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly fromApi: boolean

  constructor(message: string, status: number, code: string | null = null, fromApi = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fromApi = fromApi
  }
}

interface NestErrorBody {
  statusCode: number
  message: string | string[]
  error?: unknown
  code?: unknown
}

function isNestErrorBody(body: unknown): body is NestErrorBody {
  if (typeof body !== 'object' || body === null) return false
  const candidate = body as Record<string, unknown>
  const message = candidate.message
  return (
    typeof candidate.statusCode === 'number' &&
    (typeof message === 'string' ||
      (Array.isArray(message) && message.every((m) => typeof m === 'string')))
  )
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown
  try {
    body = await response.json()
  } catch {
    return new ApiError(GENERIC_ERROR_MESSAGE, response.status)
  }
  if (response.status >= 500 || !isNestErrorBody(body)) {
    return new ApiError(GENERIC_ERROR_MESSAGE, response.status)
  }
  const message = Array.isArray(body.message) ? body.message.join(', ') : body.message
  const code =
    typeof body.code === 'string' ? body.code : typeof body.error === 'string' ? body.error : null
  return new ApiError(message, response.status, code, true)
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  let response: Response
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(GENERIC_ERROR_MESSAGE, 0)
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError(GENERIC_ERROR_MESSAGE, response.status)
  }
}

let refreshPromise: Promise<void> | null = null

export function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiFetch<AuthResponse>('/auth/refresh', { method: 'POST' })
      .then((data) => {
        useAuthStore.getState().setSession(data.accessToken, data.user)
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const withAuthHeader = (token: string | null): RequestInit => ({
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  try {
    return await apiFetch<T>(path, withAuthHeader(useAuthStore.getState().accessToken))
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      try {
        await refreshSession()
      } catch {
        useAuthStore.getState().clearSession()
        throw err
      }
      return apiFetch<T>(path, withAuthHeader(useAuthStore.getState().accessToken))
    }
    throw err
  }
}
