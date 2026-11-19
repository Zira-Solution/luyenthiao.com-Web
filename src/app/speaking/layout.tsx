import { RequireAuth } from '@/components/auth'

export default function SpeakingLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  return <RequireAuth>{children}</RequireAuth>
}
