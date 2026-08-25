import type { Metadata } from 'next'

import { ThemeProvider } from '@/components/common'
import { APP_DESCRIPTION, APP_NAME } from '@/constants'
import { env } from '@/lib/env'
import { baloo2, nunito } from '@/lib/fonts'
import { QueryProvider } from '@/providers/query-provider'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html lang="vi" suppressHydrationWarning className={`${baloo2.variable} ${nunito.variable}`}>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
