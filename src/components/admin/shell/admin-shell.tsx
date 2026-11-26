'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ADMIN_NAV } from './admin-nav'
import { isAdminNavActive } from './admin-nav-match'
import { AdminSidebar } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'

import { cn } from '@/lib/utils'

export interface AdminShellProps {
  children: React.ReactNode
}

const DRAWER_ID = 'admin-sidebar'

function resolveSectionLabel(pathname: string): string {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (isAdminNavActive(pathname, item.href, item.exact)) return item.label
    }
  }
  return 'Quản trị'
}

export function AdminShell({ children }: AdminShellProps): React.ReactElement {
  const pathname = usePathname()
  // The drawer is open only for the route it was opened on, so any route change closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const open = openAt === pathname
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sectionLabel = resolveSectionLabel(pathname)

  const closeAndRestoreFocus = useCallback(() => {
    setOpenAt(null)
    menuButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') closeAndRestoreFocus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeAndRestoreFocus])

  return (
    <div className="admin-theme bg-admin-canvas min-h-screen text-slate-900">
      {open && (
        <div
          data-testid="admin-drawer-overlay"
          aria-hidden="true"
          onClick={closeAndRestoreFocus}
          className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
        />
      )}

      <aside
        id={DRAWER_ID}
        data-open={open}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] transition-[transform,width] duration-200 motion-reduce:transition-none lg:z-40 lg:max-w-none lg:translate-x-0',
          collapsed ? 'lg:w-17' : 'lg:w-64',
          open ? 'translate-x-0' : 'max-lg:invisible max-lg:-translate-x-full',
        )}
      >
        <AdminSidebar collapsed={collapsed} onNavigate={() => setOpenAt(null)} />
      </aside>

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200 motion-reduce:transition-none',
          collapsed ? 'lg:pl-17' : 'lg:pl-64',
        )}
      >
        <AdminTopbar
          ref={menuButtonRef}
          drawerId={DRAWER_ID}
          drawerOpen={open}
          onOpenDrawer={() => setOpenAt(pathname)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          sectionLabel={sectionLabel}
        />

        <main className="flex-1">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
