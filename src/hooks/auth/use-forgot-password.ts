"use client"

import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api-client"
import type { ForgotPasswordInput, ForgotPasswordResponse } from "@/types/auth"

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  })
}
