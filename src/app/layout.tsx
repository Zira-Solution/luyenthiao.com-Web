import type { Metadata, Viewport } from 'next'

import { ThemeProvider } from '@/components/common'
import { APP_DESCRIPTION, APP_NAME } from '@/constants'
import { env } from '@/lib/env'
import { baloo2, inter, nunito } from '@/lib/fonts'
import { AuthProvider } from '@/providers/auth-provider'
import { QueryProvider } from '@/providers/query-provider'

import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.ReactElement {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${baloo2.variable} ${nunito.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
