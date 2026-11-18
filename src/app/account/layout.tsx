import { RequireAuth } from '@/components/auth'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
