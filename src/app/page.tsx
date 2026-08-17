import type { Metadata } from 'next'

import { HelloPlaceholder } from '@/components/common'

export const metadata: Metadata = {
  title: 'Home',
  description: 'English Game — placeholder home page.',
  keywords: ['english game'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'English Game',
    description: 'English Game — placeholder home page.',
    type: 'website',
  },
}

export default function HomePage(): React.ReactElement {
  return <HelloPlaceholder />
}
