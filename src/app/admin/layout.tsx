import { RequireAdmin, RequireAuth } from '@/components/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return (
    <RequireAuth>
      <RequireAdmin>{children}</RequireAdmin>
    </RequireAuth>
  )
}
