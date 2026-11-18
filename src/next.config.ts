import type { NextConfig } from 'next'

import { env } from './lib/env'
import { buildSecurityHeaders } from './lib/security-headers'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Do not advertise the framework and version in an x-powered-by header.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders({
          apiUrl: env.API_URL,
          isProduction: process.env.NODE_ENV === 'production',
        }),
      },
    ]
  },
}

export default nextConfig
