import Link from 'next/link'

import { ROUTES } from '@/constants'

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-6xl font-bold">404</h2>
        <p className="mb-8 text-xl text-muted-foreground">Page not found</p>
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
