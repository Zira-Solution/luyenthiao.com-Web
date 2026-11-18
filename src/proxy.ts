import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { AUTH_HINT_COOKIE } from './lib/auth-hint-cookie'
import { decideRoute } from './lib/route-access'

// Optimistic checks only (node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md → Limitations). The
// hint cookie is not a security boundary; the backend checks the real session on every API call.
export function proxy(request: NextRequest): NextResponse {
  const decision = decideRoute({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    method: request.method,
    secFetchSite: request.headers.get('sec-fetch-site'),
    hasAuthHint: request.cookies.get(AUTH_HINT_COOKIE)?.value === '1',
  })

  switch (decision.kind) {
    case 'forbidden':
      return NextResponse.json(
        { message: 'Yêu cầu không hợp lệ.', code: 'CROSS_SITE_REQUEST' },
        { status: 403 },
      )
    case 'redirect':
      return NextResponse.redirect(new URL(decision.location, request.url))
    case 'next':
      return NextResponse.next()
  }
}

export const config = {
  // Everything except Next internals and the root metadata files; other static files are let through by
  // decideRoute (STATIC_FILE).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
