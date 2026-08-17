import type { MetadataRoute } from 'next'

import { ROUTES } from '@/constants'
import { env } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${env.APP_URL}${ROUTES.HOME}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    // Add more public routes here as they're built
  ]
}
