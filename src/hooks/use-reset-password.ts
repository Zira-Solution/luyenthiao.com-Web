"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import type { ResetPasswordInput } from "@/types/auth"

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      apiFetch<void>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  })
}
