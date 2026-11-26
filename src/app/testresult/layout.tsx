'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { RequireAuth } from '@/components/auth'

function TestResultGuard({ children }: { children: React.ReactNode }): React.ReactElement {
  const searchParams = useSearchParams()
  if (searchParams.get('demo') === '1') {
    return <>{children}</>
  }
  return <RequireAuth>{children}</RequireAuth>
}

export default function TestResultLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <Suspense fallback={null}>
      <TestResultGuard>{children}</TestResultGuard>
    </Suspense>
  )
}
