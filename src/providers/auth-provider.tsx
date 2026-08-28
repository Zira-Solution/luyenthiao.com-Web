"use client"

import { useEffect } from "react"

import { refreshSession } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    let cancelled = false

    // refreshSession() already updates the auth store internally (via
    // setSession on success) and dedupes concurrent calls via its
    // module-level refreshPromise — this is the same single-flight path
    // authFetch uses for its own 401-triggered refreshes, so the bootstrap
    // call on mount can't race a concurrent refresh into a duplicate
    // rotation (which the backend punishes by revoking the whole session).
    refreshSession().catch(() => {
      // Expected for a logged-out visitor (no cookie, or an expired one) —
      // not an error to surface, just means "not logged in." refreshSession
      // itself does not clear the store on failure (only authFetch's catch
      // path does that, and we're bypassing authFetch here), so we still
      // need to flip status to "unauthenticated" ourselves.
      if (!cancelled) clearSession()
    })

    return () => {
      cancelled = true
    }
  }, [clearSession])

  return <>{children}</>
}
