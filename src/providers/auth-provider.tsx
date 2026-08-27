"use client"

import { useEffect } from "react"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse } from "@/types/auth"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    let cancelled = false

    apiFetch<AuthResponse>("/auth/refresh", { method: "POST" })
      .then((data) => {
        if (!cancelled) setSession(data.accessToken, data.user)
      })
      .catch(() => {
        // Expected for a logged-out visitor (no cookie, or an expired one) —
        // not an error to surface, just means "not logged in."
        if (!cancelled) clearSession()
      })

    return () => {
      cancelled = true
    }
  }, [setSession, clearSession])

  return <>{children}</>
}
