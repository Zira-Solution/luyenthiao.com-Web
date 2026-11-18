import { RequireAuth } from '@/components/auth'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
