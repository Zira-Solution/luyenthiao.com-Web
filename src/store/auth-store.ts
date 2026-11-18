'use client'

import { create } from 'zustand'

import { clearAuthHint, setAuthHint } from '@/lib/auth-hint-cookie'
import type { User } from '@/types/auth'

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated'

interface AuthStoreState {
  accessToken: string | null
  user: User | null
  status: AuthStatus
  /** True after a deliberate logout, so guards send the visitor home instead of to /login. */
  signedOut: boolean
  setSession: (accessToken: string, user: User) => void
  clearSession: (reason?: 'logout') => void
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  accessToken: null,
  user: null,
  status: 'idle',
  signedOut: false,

  setSession: (accessToken, user) => {
    setAuthHint()
    set({ accessToken, user, status: 'authenticated', signedOut: false })
  },

  clearSession: (reason) => {
    clearAuthHint()
    set({
      accessToken: null,
      user: null,
      status: 'unauthenticated',
      signedOut: reason === 'logout',
    })
  },
}))
