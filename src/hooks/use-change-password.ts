"use client"

import { useMutation } from "@tanstack/react-query"

import { authFetch } from "@/lib/api-client"
import type { ChangePasswordInput } from "@/types/auth"

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      authFetch<void>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  })
}
