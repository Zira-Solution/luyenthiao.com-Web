'use client'

import { ChevronLeft, ChevronRight, Eye, Loader2, Lock, Search, Unlock } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { UserDetailDialog } from './user-detail-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminSchools, useAdminUsers, useUpdateAdminUser } from '@/hooks/admin'
import { cn } from '@/lib/utils'
import type { AdminUserRow } from '@/schemas/admin-users'
import { useAuthStore } from '@/store/auth-store'

const PAGE_LIMIT = 20

export function UsersAdminView(): ReactElement {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [schoolFilter, setSchoolFilter] = useState('')
  const [bannedFilter, setBannedFilter] = useState<'all' | 'true' | 'false'>('all')
  const [page, setPage] = useState(1)

  const [detailUserId, setDetailUserId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminUsers({
    q: search.trim() || undefined,
    role: roleFilter === 'ALL' ? undefined : roleFilter,
    schoolId: schoolFilter ? Number.parseInt(schoolFilter, 10) : undefined,
    isBanned: bannedFilter === 'all' ? undefined : bannedFilter === 'true',
    page,
    limit: PAGE_LIMIT,
  })
  const { data: schools = [] } = useAdminSchools()
  const updateUser = useUpdateAdminUser()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const handleRoleChange = async (user: AdminUserRow, nextRole: 'USER' | 'ADMIN') => {
    if (nextRole === user.role) return
    if (
      !window.confirm(
        `Đổi vai trò của "${user.username}" sang ${nextRole}? Phiên đăng nhập hiện tại của tài khoản này sẽ bị thu hồi.`,
      )
    ) {
      return
    }
    setActionError(null)
    try {
      await updateUser.mutateAsync({ id: user.id, input: { role: nextRole } })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không đổi được vai trò.')
    }
  }

  const handleSchoolChange = async (user: AdminUserRow, nextSchoolStr: string) => {
    const nextSchoolId = nextSchoolStr ? Number.parseInt(nextSchoolStr, 10) : null
    setActionError(null)
    try {
      await updateUser.mutateAsync({ id: user.id, input: { schoolId: nextSchoolId } })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không cập nhật được trường.')
    }
  }

  const handleToggleBan = async (user: AdminUserRow) => {
    const nextBanned = !user.isBanned
    const msg = nextBanned
      ? `Khóa tài khoản "${user.username}"? Người dùng sẽ bị đăng xuất khỏi mọi thiết bị ngay lập tức.`
      : `Mở khóa tài khoản "${user.username}"?`
    if (!window.confirm(msg)) return
    setActionError(null)
    try {
      await updateUser.mutateAsync({ id: user.id, input: { isBanned: nextBanned } })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không cập nhật được trạng thái khóa.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý Người dùng"
        description="Tra cứu tài khoản, phân quyền USER/ADMIN, gán trường học và khóa/mở tài khoản kèm thu hồi phiên JWT."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Người dùng' }]}
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được người dùng.')}
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
              placeholder="Tìm tên, username hoặc email..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <select
            aria-label="Lọc vai trò"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="ALL">Mọi vai trò</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <select
            aria-label="Lọc trường học"
            value={schoolFilter}
            onChange={(e) => {
              setSchoolFilter(e.target.value)
              setPage(1)
            }}
            className="max-w-52 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="">Mọi trường</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Lọc trạng thái khóa"
            value={bannedFilter}
            onChange={(e) => {
              setBannedFilter(e.target.value as 'all' | 'true' | 'false')
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="false">Hoạt động</option>
            <option value="true">Đã khóa</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải danh sách người dùng...
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Không có người dùng nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">Tài khoản</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trường học</th>
                  <th className="px-4 py-3">Hoạt động</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((u) => {
                  const isSelf = currentUserId === u.id
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {u.fullName || u.username}
                          {isSelf && (
                            <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                              Bạn
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          @{u.username} {u.email ? `· ${u.email}` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Vai trò của ${u.username}`}
                          disabled={isSelf || updateUser.isPending}
                          value={u.role}
                          onChange={(e) =>
                            void handleRoleChange(u, e.target.value as 'USER' | 'ADMIN')
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Trường của ${u.username}`}
                          disabled={updateUser.isPending}
                          value={u.schoolId ? String(u.schoolId) : ''}
                          onChange={(e) => void handleSchoolChange(u, e.target.value)}
                          className="max-w-48 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800"
                        >
                          <option value="">— Chưa gán —</option>
                          {schools.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {u._count?.examAttempts ?? 0} bài thi · {u._count?.pointLogs ?? 0} log điểm
                      </td>
                      <td className="px-4 py-3">
                        {u.isBanned ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                            Đã khóa
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailUserId(u.id)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="size-3.5" aria-hidden="true" />
                            Hồ sơ
                          </button>
                          <button
                            type="button"
                            disabled={isSelf || updateUser.isPending}
                            onClick={() => void handleToggleBan(u)}
                            aria-label={u.isBanned ? `Mở khóa ${u.username}` : `Khóa ${u.username}`}
                            className={cn(
                              'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45',
                              u.isBanned
                                ? 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                                : 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50',
                            )}
                          >
                            {u.isBanned ? (
                              <>
                                <Unlock className="size-3.5" aria-hidden="true" />
                                Mở khóa
                              </>
                            ) : (
                              <>
                                <Lock className="size-3.5" aria-hidden="true" />
                                Khóa
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Tổng {total} tài khoản · Trang {page}/{totalPages}
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

      <UserDetailDialog userId={detailUserId} onClose={() => setDetailUserId(null)} />
    </>
  )
}
