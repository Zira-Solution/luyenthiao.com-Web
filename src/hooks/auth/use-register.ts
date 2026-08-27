"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse, RegisterInput } from "@/types/auth"

export function useRegister() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
    },
  })
}
