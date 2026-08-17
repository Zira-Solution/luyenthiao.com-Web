'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps): React.ReactElement {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground mb-8">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
