'use client'

import { QueryClientContext } from '@tanstack/react-query'
import { ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useContext } from 'react'

import { ADMIN_NAV, type AdminNavBadgeKey } from './admin-nav'
import { isAdminNavActive } from './admin-nav-match'

import { useLogout } from '@/hooks'
import { useAdminGradingCounts } from '@/hooks/admin'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'

export interface AdminSidebarProps {
  /** Whether desktop icon-rail collapsed mode is active. */
  collapsed?: boolean
  /** Called when a navigation link is clicked, so the mobile drawer can close. */
  onNavigate?: () => void
}

// `User` in `@/types/auth` only declares `id` and `role`, but the API also returns these (the Topbar reads them).
interface SidebarUser {
  role: string
  fullName?: string
  username?: string
}

const FOCUS_RING =
  'focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-2 focus-visible:ring-offset-admin-sidebar focus-visible:outline-none'

function getInitials(name: string | undefined): string {
  const clean = (name ?? '').trim()
  if (!clean) return 'AD'
  const parts = clean.split(/\s+/)
  const first = parts[0] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts.at(-1) ?? ''
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

function PendingGradingBadgeInner({
  collapsed,
}: {
  collapsed: boolean
}): React.ReactElement | null {
  const { totalPending } = useAdminGradingCounts()
  if (totalPending <= 0) return null
  return (
    <span
      aria-hidden="true"
      data-testid="sidebar-pending-grading-badge"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-amber-500 font-semibold text-white',
        collapsed ? 'size-4 text-[10px]' : 'ml-auto min-w-5 px-1.5 py-0.5 text-[11px]',
      )}
    >
      {totalPending > 99 ? '99+' : totalPending}
    </span>
  )
}

function AdminNavBadge({
  badgeKey,
  collapsed,
}: {
  badgeKey?: AdminNavBadgeKey
  collapsed: boolean
}): React.ReactElement | null {
  const queryClient = useContext(QueryClientContext)
  if (badgeKey !== 'pendingGrading' || !queryClient) return null
  return <PendingGradingBadgeInner collapsed={collapsed} />
}

export function AdminSidebar({
  collapsed = false,
  onNavigate,
}: AdminSidebarProps): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.user) as SidebarUser | null
  const logout = useLogout()
  const displayName = user?.fullName || user?.username || 'Admin'

  return (
    <div className="from-admin-sidebar to-admin-sidebar-deep border-admin-sidebar-border flex h-full flex-col border-r bg-gradient-to-b text-white">
      <div
        className={cn(
          'border-admin-sidebar-border flex h-14 shrink-0 items-center border-b',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="Luyenthiao CMS"
          className={cn('flex items-center gap-2.5 rounded-lg', FOCUS_RING)}
        >
          <span className="bg-admin-primary flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm">
            L
          </span>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-white">Luyenthiao</span>
          )}
        </Link>
        {!collapsed && (
          <span className="bg-admin-sidebar-card border-admin-sidebar-border text-admin-accent rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
            CMS
          </span>
        )}
      </div>

      <nav aria-label="Menu quản trị" className="flex-1 overflow-y-auto px-2.5 py-4">
        {ADMIN_NAV.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="text-admin-sidebar-muted px-2.5 pb-2 text-[11px] font-semibold tracking-wider uppercase">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isAdminNavActive(pathname, item.href, item.exact)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-label={item.label}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center rounded-lg py-2 text-sm font-medium transition-colors',
                        collapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
                        FOCUS_RING,
                        active
                          ? 'bg-admin-sidebar-active border-admin-accent border-l-2 text-white shadow-xs'
                          : 'text-admin-sidebar-fg hover:bg-admin-sidebar-hover hover:text-white',
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                      <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
                      <AdminNavBadge badgeKey={item.badgeKey} collapsed={collapsed} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-admin-sidebar-border shrink-0 space-y-1.5 border-t p-2.5">
        <div
          className={cn(
            'bg-admin-sidebar-card flex items-center rounded-lg',
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2',
          )}
        >
          <span
            aria-hidden="true"
            className="bg-admin-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          >
            {getInitials(displayName)}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{displayName}</p>
              <p className="text-admin-accent truncate text-[11px] font-medium">
                {user?.role ?? 'ADMIN'}
              </p>
            </div>
          )}
        </div>

        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? 'Về trang học viên' : undefined}
          className={cn(
            'text-admin-sidebar-fg hover:bg-admin-sidebar-hover flex items-center rounded-lg py-2 text-sm transition-colors hover:text-white',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
            FOCUS_RING,
          )}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          <span className={collapsed ? 'sr-only' : 'truncate'}>Về trang học viên</span>
        </Link>

        <button
          type="button"
          title={collapsed ? 'Đăng xuất' : undefined}
          onClick={() => logout.mutate(undefined, { onSettled: () => router.push('/') })}
          className={cn(
            'text-admin-sidebar-fg hover:bg-admin-sidebar-hover flex w-full cursor-pointer items-center rounded-lg py-2 text-left text-sm transition-colors hover:text-white',
            collapsed ? 'justify-center px-2' : 'gap-2.5 px-2.5',
            FOCUS_RING,
          )}
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          <span className={collapsed ? 'sr-only' : 'truncate'}>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
