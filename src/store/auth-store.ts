"use client"

import { create } from "zustand"

import type { User } from "@/types/auth"

export type AuthStatus = "idle" | "authenticated" | "unauthenticated"

interface AuthStoreState {
  accessToken: string | null
  user: User | null
  status: AuthStatus
  setSession: (accessToken: string, user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  accessToken: null,
  user: null,
  status: "idle",

  setSession: (accessToken, user) => {
    set({ accessToken, user, status: "authenticated" })
  },

  clearSession: () => {
    set({ accessToken: null, user: null, status: "unauthenticated" })
  },
}))
