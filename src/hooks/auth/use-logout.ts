"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiFetch<void>("/auth/logout", { method: "POST" }),
    onSettled: () => {
      // Best-effort, matching the backend's own logout design: clear local
      // session state even if the server call itself failed.
      clearSession()
      queryClient.clear()
    },
  })
}
