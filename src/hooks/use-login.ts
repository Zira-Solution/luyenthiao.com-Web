"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth-store"
import type { AuthResponse, LoginInput } from "@/types/auth"

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
    },
  })
}
