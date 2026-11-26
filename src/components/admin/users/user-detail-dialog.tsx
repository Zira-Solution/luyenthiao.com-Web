'use client'

import { Award, FileCheck2, Loader2, X } from 'lucide-react'
import type { ReactElement } from 'react'

import { useAdminUserDetail } from '@/hooks/admin'

export interface UserDetailDialogProps {
  userId: number | null
  onClose: () => void
}

export function UserDetailDialog({ userId, onClose }: UserDetailDialogProps): ReactElement | null {
  const { data, isLoading, error } = useAdminUserDetail(userId)

  if (!userId) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hồ sơ người dùng"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">Hồ sơ người dùng #{userId}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải chi tiết tài khoản...
          </div>
        ) : error || !data ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error instanceof Error ? error.message : 'Không tải được hồ sơ.'}
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">Tên hiển thị / Username</p>
                <p className="font-semibold text-slate-900">
                  {data.fullName || data.username} (@{data.username})
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-800">{data.email || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Vai trò & Trạng thái</p>
                <p className="text-sm font-semibold text-slate-900">
                  {data.role} · {data.isBanned ? 'Đã khóa' : 'Đang hoạt động'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tổng điểm tích lũy</p>
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700">
                  <Award className="size-4" aria-hidden="true" />
                  {data.totalPoints} điểm
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <FileCheck2 className="size-4 text-blue-600" aria-hidden="true" />
                Lượt làm bài gần đây ({data._count?.examAttempts ?? 0})
              </h3>
              {data.recentAttempts.length === 0 ? (
                <p className="text-xs text-slate-500">Chưa có bài làm nào.</p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {data.recentAttempts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div>
                        <p className="font-medium text-slate-900">{a.examTitle}</p>
                        <p className="text-slate-500">
                          {a.levelSlug.toUpperCase()} ·{' '}
                          {new Date(a.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className="font-semibold text-blue-700">
                        {a.score}/{a.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Nhật ký điểm gần đây ({data._count?.pointLogs ?? 0})
              </h3>
              {data.recentPoints.length === 0 ? (
                <p className="text-xs text-slate-500">Chưa có nhật ký điểm nào.</p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {data.recentPoints.map((pt) => (
                    <div
                      key={pt.id}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-slate-700">
                        {pt.source} {pt.refId ? `(${pt.refId.slice(0, 12)})` : ''}
                      </span>
                      <span className="font-semibold text-emerald-700">+{pt.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
