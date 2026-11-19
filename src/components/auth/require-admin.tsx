'use client'

import { NotFoundView } from '@/components/common'
import { useAuthStore } from '@/store/auth-store'

export interface RequireAdminProps {
  children: React.ReactNode
}

/**
 * UX guard for /admin/* (spec §4). Use inside RequireAuth. The backend's AdminGuard ('ADMIN', upper case) is the real
 * boundary; this only keeps the editor from mounting for other roles.
 */
export function RequireAdmin({ children }: RequireAdminProps): React.ReactElement {
  const role = useAuthStore((state) => state.user?.role)
  if (role !== 'ADMIN') return <NotFoundView />
  return <>{children}</>
}
