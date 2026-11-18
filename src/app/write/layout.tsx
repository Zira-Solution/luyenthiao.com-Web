import { RequireAuth } from '@/components/auth'

export default function WriteLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
