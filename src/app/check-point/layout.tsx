'use client'

import { usePathname } from 'next/navigation'

import { RequireAuth } from '@/components/auth'

export default function CheckPointLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const pathname = usePathname()
  if (pathname === '/check-point/demo') {
    return <>{children}</>
  }
  return <RequireAuth>{children}</RequireAuth>
}
