'use client'

import { Loader2, Search, X } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { searchNotificationUsers } from '@/lib/api/admin/notifications'
import {
  NOTIFICATION_TYPES,
  type CreateAdminNotificationInput,
  type NotificationSearchUser,
} from '@/schemas/admin-notification'

export interface NotificationFormDialogProps {
  open: boolean
  submitting: boolean
  onClose: () => void
  onSend: (input: CreateAdminNotificationInput) => Promise<void>
}

export function NotificationFormDialog(props: NotificationFormDialogProps): ReactElement | null {
  if (!props.open) return null
  return <NotificationFormDialogInner {...props} />
}

function NotificationFormDialogInner({
  submitting,
  onClose,
  onSend,
}: NotificationFormDialogProps): ReactElement {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<(typeof NOTIFICATION_TYPES)[number]>('SYSTEM')
  const [scope, setScope] = useState<'global' | 'user'>('global')
  const [userQuery, setUserQuery] = useState('')
  const [userResults, setUserResults] = useState<NotificationSearchUser[]>([])
  const [searchingUsers, setSearchingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<NotificationSearchUser | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleUserSearch = async () => {
    const q = userQuery.trim()
    if (!q) {
      setUserResults([])
      return
    }
    setSearchingUsers(true)
    try {
      const list = await searchNotificationUsers(q)
      setUserResults(list)
    } catch {
      setUserResults([])
    } finally {
      setSearchingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!title.trim()) {
      setErrorMsg('Tiêu đề thông báo không được để trống.')
      return
    }
    if (!message.trim()) {
      setErrorMsg('Nội dung thông báo không được để trống.')
      return
    }
    if (scope === 'user' && !selectedUser) {
      setErrorMsg('Vui lòng tìm và chọn 1 người nhận.')
      return
    }

    try {
      await onSend({
        title: title.trim(),
        message: message.trim(),
        type,
        ...(scope === 'user' && selectedUser ? { targetUserId: selectedUser.id } : {}),
      })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không gửi được thông báo.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gửi thông báo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">Gửi thông báo mới</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
          >
            {errorMsg}
          </div>
        )}

        <form noValidate onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="notif-type"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Loại thông báo
              </label>
              <select
                id="notif-type"
                value={type}
                onChange={(e) => setType(e.target.value as (typeof NOTIFICATION_TYPES)[number])}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {NOTIFICATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="notif-scope"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Đối tượng nhận
              </label>
              <select
                id="notif-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value as 'global' | 'user')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              >
                <option value="global">Toàn hệ thống</option>
                <option value="user">Một học viên cụ thể</option>
              </select>
            </div>
          </div>

          {scope === 'user' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-1.5 text-xs font-semibold text-slate-700">Tìm người nhận</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Tên, username hoặc email..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-8 text-sm text-slate-900 placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleUserSearch()}
                  disabled={searchingUsers}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {searchingUsers ? 'Đang tìm...' : 'Tìm'}
                </button>
              </div>

              {selectedUser && (
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  Đã chọn: {selectedUser.fullName || selectedUser.username} (@
                  {selectedUser.username})
                </p>
              )}

              {userResults.length > 0 && (
                <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(u)
                        setUserResults([])
                      }}
                      className="flex w-full cursor-pointer items-center justify-between rounded bg-white px-2.5 py-1.5 text-left text-xs hover:bg-blue-50"
                    >
                      <span className="font-medium text-slate-900">{u.fullName || u.username}</span>
                      <span className="text-slate-500">@{u.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="notif-title"
              className="mb-1 block text-xs font-semibold text-slate-700"
            >
              Tiêu đề *
            </label>
            <input
              id="notif-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Mở khóa đề thi thử tháng 11"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="notif-msg" className="mb-1 block text-xs font-semibold text-slate-700">
              Nội dung *
            </label>
            <textarea
              id="notif-msg"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo gửi tới học viên..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Gửi thông báo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
