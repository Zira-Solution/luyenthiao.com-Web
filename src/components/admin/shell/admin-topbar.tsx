'use client'

import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { forwardRef } from 'react'

export interface AdminTopbarProps {
  drawerId: string
  drawerOpen: boolean
  onOpenDrawer: () => void
  collapsed: boolean
  onToggleCollapse: () => void
  sectionLabel: string
}

export const AdminTopbar = forwardRef<HTMLButtonElement, AdminTopbarProps>(function AdminTopbar(
  { drawerId, drawerOpen, onOpenDrawer, collapsed, onToggleCollapse, sectionLabel },
  menuButtonRef,
): React.ReactElement {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Mở menu quản trị"
          aria-expanded={drawerOpen}
          aria-controls={drawerId}
          onClick={onOpenDrawer}
          className="focus-visible:ring-brand-primary -ml-1.5 flex size-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:outline-none lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label={collapsed ? 'Mở rộng menu quản trị' : 'Thu gọn menu quản trị'}
          aria-pressed={collapsed}
          onClick={onToggleCollapse}
          className="focus-visible:ring-brand-primary hidden size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:outline-none lg:inline-flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
        </button>

        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500">
          <span className="hidden font-medium text-slate-500 sm:inline">CMS</span>
          <span aria-hidden="true" className="hidden text-slate-300 sm:inline">
            /
          </span>
          <span className="truncate font-semibold text-slate-900">{sectionLabel}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
          Lưu cục bộ
        </span>
      </div>
    </header>
  )
})
