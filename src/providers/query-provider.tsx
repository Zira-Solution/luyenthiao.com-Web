'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { PrivateDataCleanup } from '@/providers/private-data-cleanup'
import { SiteConfigProvider } from '@/providers/site-config-provider'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PrivateDataCleanup />
      <SiteConfigProvider>{children}</SiteConfigProvider>
    </QueryClientProvider>
  )
}
