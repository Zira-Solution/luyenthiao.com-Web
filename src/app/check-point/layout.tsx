import { RequireAuth } from '@/components/auth'

export default function CheckPointLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
