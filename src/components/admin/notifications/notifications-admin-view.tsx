'use client'

import { ChevronLeft, ChevronRight, Globe, Loader2, Plus, Search, Trash2, User } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { NotificationFormDialog } from './notification-form-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminNotifications,
  useCreateAdminNotification,
  useDeleteAdminNotification,
} from '@/hooks/admin'
import {
  NOTIFICATION_TYPES,
  type AdminNotification,
  type CreateAdminNotificationInput,
} from '@/schemas/admin-notification'

const PAGE_LIMIT = 20

export function NotificationsAdminView(): ReactElement {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminNotifications({
    type: typeFilter === 'all' ? undefined : typeFilter,
    q: search.trim() || undefined,
    page,
    limit: PAGE_LIMIT,
  })
  const createNotif = useCreateAdminNotification()
  const deleteNotif = useDeleteAdminNotification()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const handleSend = async (input: CreateAdminNotificationInput) => {
    await createNotif.mutateAsync(input)
    setDialogOpen(false)
  }

  const handleDelete = async (item: AdminNotification) => {
    if (!window.confirm(`Xóa thông báo "${item.title}"?`)) return
    setActionError(null)
    try {
      await deleteNotif.mutateAsync(item.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được thông báo.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý Thông báo"
        description="Gửi thông báo toàn hệ thống hoặc riêng từng học viên và theo dõi lượt đã đọc."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Thông báo' }]}
        actions={
          <button
            type="button"
            onClick={() => {
              setActionError(null)
              setDialogOpen(true)
            }}
            className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <Plus className="size-4" aria-hidden="true" />
            Gửi thông báo
          </button>
        }
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được thông báo.')}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm tiêu đề, nội dung, người nhận..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <select
            aria-label="Lọc loại thông báo"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="all">Mọi loại</option>
            {NOTIFICATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải thông báo...
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Chưa có thông báo nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Tiêu đề & Nội dung</th>
                  <th className="px-4 py-3">Đối tượng</th>
                  <th className="px-4 py-3">Đã đọc</th>
                  <th className="px-4 py-3">Ngày gửi</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="line-clamp-2 text-xs text-slate-600">{item.message}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item.targetUser ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 font-medium text-purple-700">
                          <User className="size-3.5" aria-hidden="true" />
                          {item.targetUser.fullName || item.targetUser.username}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700">
                          <Globe className="size-3.5" aria-hidden="true" />
                          Toàn hệ thống
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                      {item._count?.reads ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        aria-label={`Xóa ${item.title}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Tổng {total} thông báo · Trang {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Sau
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <NotificationFormDialog
        open={dialogOpen}
        submitting={createNotif.isPending}
        onClose={() => setDialogOpen(false)}
        onSend={handleSend}
      />
    </>
  )
}
