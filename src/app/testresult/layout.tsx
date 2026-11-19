import { RequireAuth } from '@/components/auth'

export default function TestResultLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
