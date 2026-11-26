import type { NextConfig } from 'next'

import { env } from './lib/env'
import { buildSecurityHeaders } from './lib/security-headers'

type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number]

function buildRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [{ protocol: 'https', hostname: '**.r2.dev', pathname: '/**' }]
  const r2Base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  if (r2Base) {
    try {
      const url = new URL(r2Base)
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        patterns.push({
          protocol: url.protocol.slice(0, -1) as 'http' | 'https',
          hostname: url.hostname,
          ...(url.port ? { port: url.port } : {}),
          pathname: '/**',
        })
      }
    } catch {
      // Bỏ qua biến R2 URL không hợp lệ khi build
    }
  }
  return patterns
}

const nextConfig: NextConfig = {
  output: 'standalone',
  // Do not advertise the framework and version in an x-powered-by header.
  poweredByHeader: false,
  images: {
    remotePatterns: buildRemotePatterns(),
  },
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
