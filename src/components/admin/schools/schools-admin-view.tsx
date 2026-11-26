'use client'

import { Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { SchoolFormDialog } from './school-form-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminSchools,
  useCreateAdminSchool,
  useDeleteAdminSchool,
  useUpdateAdminSchool,
} from '@/hooks/admin'
import type { AdminSchool, SaveAdminSchoolInput } from '@/schemas/admin-school'

export function SchoolsAdminView(): ReactElement {
  const { data: schools = [], isLoading, error } = useAdminSchools()
  const createSchool = useCreateAdminSchool()
  const updateSchool = useUpdateAdminSchool()
  const deleteSchool = useDeleteAdminSchool()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminSchool | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleSave = async (input: SaveAdminSchoolInput, editingId?: number) => {
    if (editingId) {
      await updateSchool.mutateAsync({ id: editingId, input })
    } else {
      await createSchool.mutateAsync(input)
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = async (school: AdminSchool) => {
    const count = school._count?.users ?? 0
    if (count > 0) {
      setActionError(`Không thể xóa trường "${school.name}" đang có ${count} học sinh liên kết.`)
      return
    }
    if (!window.confirm(`Xóa trường "${school.name}"?`)) return
    setActionError(null)
    try {
      await deleteSchool.mutateAsync(school.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được trường học.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý Trường học"
        description="Quản lý danh sách trường cho học viên chọn khi đăng ký và bảng xếp hạng trường học."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Trường học' }]}
        actions={
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setActionError(null)
              setDialogOpen(true)
            }}
            className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-xs"
          >
            <Plus className="size-4" aria-hidden="true" />
            Thêm trường
          </button>
        }
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được trường học.')}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải danh sách trường...
          </div>
        ) : schools.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Chưa có trường học nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên trường</th>
                  <th className="px-4 py-3">Tỉnh / Thành phố</th>
                  <th className="px-4 py-3">Số học viên</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools.map((school) => {
                  const userCount = school._count?.users ?? 0
                  return (
                    <tr key={school.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500">
                        #{school.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{school.name}</td>
                      <td className="px-4 py-3 text-slate-600">{school.city || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          <Users className="size-3.5" aria-hidden="true" />
                          {userCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {school.active ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            Tạm ẩn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(school)
                              setActionError(null)
                              setDialogOpen(true)
                            }}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={userCount > 0}
                            title={
                              userCount > 0
                                ? `Trường đang có ${userCount} học sinh liên kết`
                                : undefined
                            }
                            onClick={() => void handleDelete(school)}
                            aria-label={`Xóa ${school.name}`}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Xóa
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
      </div>

      <SchoolFormDialog
        open={dialogOpen}
        editing={editing}
        submitting={createSchool.isPending || updateSchool.isPending}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    </>
  )
}
