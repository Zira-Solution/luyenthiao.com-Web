import { env } from "@/lib/env"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse } from "@/types/auth"

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

interface ApiErrorBody {
  message?: string | string[]
  error?: string
  statusCode?: number
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    if (Array.isArray(body.message)) return body.message.join(", ")
    if (typeof body.message === "string") return body.message
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại."
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${env.API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(0, "Không thể kết nối máy chủ, vui lòng thử lại.")
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

let refreshPromise: Promise<void> | null = null

function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = apiFetch<AuthResponse>("/auth/refresh", { method: "POST" })
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
