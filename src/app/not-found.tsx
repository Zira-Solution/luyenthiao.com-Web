import Link from 'next/link'

import { ROUTES } from '@/constants'

export default function NotFound(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md text-center">
        <h2 className="mb-4 text-6xl font-bold">404</h2>
        <p className="text-muted-foreground mb-8 text-xl">Page not found</p>
        <Link
          href={ROUTES.HOME}
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
