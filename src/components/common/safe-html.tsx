'use client'

import { useMemo } from 'react'

import { sanitizeHtml } from '@/lib/safe-html'

export interface SafeHtmlProps {
  html: string
  as?: 'span' | 'div'
  className?: string
}

/** The only place allowed to set innerHTML (enforced by lib/no-raw-html.test.ts). */
export function SafeHtml({ html, as: Tag = 'span', className }: SafeHtmlProps): React.ReactElement {
  // Memoised: gap-fill parts re-render on every keystroke.
  const clean = useMemo(() => sanitizeHtml(html), [html])
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />
}
