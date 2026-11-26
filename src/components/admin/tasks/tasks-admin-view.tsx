'use client'

import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { TaskFormDialog } from './task-form-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminTasks,
  useCreateAdminTask,
  useDeleteAdminTask,
  useUpdateAdminTask,
} from '@/hooks/admin'
import { cn } from '@/lib/utils'
import { TASK_CATEGORIES, type AdminTask, type SaveAdminTaskInput } from '@/schemas/admin-task'

export function TasksAdminView(): ReactElement {
  const { data: tasks = [], isLoading, error } = useAdminTasks()
  const createTask = useCreateAdminTask()
  const updateTask = useUpdateAdminTask()
  const deleteTask = useDeleteAdminTask()

  const [category, setCategory] = useState<string>('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminTask | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = category === 'ALL' ? tasks : tasks.filter((t) => t.category === category)

  const handleSave = async (input: SaveAdminTaskInput, editingId?: number) => {
    if (editingId) {
      await updateTask.mutateAsync({ id: editingId, input })
    } else {
      await createTask.mutateAsync(input)
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleToggleActive = async (task: AdminTask) => {
    setActionError(null)
    try {
      await updateTask.mutateAsync({ id: task.id, input: { active: !task.active } })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không cập nhật được trạng thái.')
    }
  }

  const handleDelete = async (task: AdminTask) => {
    if (!window.confirm(`Xóa nhiệm vụ "${task.title}"?`)) return
    setActionError(null)
    try {
      await deleteTask.mutateAsync(task.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được nhiệm vụ.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý Nhiệm vụ"
        description="Thiết lập nhiệm vụ DAILY / WEEKLY / ACHIEVEMENT, điểm thưởng và điều kiện actionType."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Nhiệm vụ' }]}
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
            Thêm nhiệm vụ
          </button>
        }
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được nhiệm vụ.')}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          {['ALL', ...TASK_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                category === cat
                  ? 'bg-admin-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100',
              )}
            >
              {cat === 'ALL' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải nhiệm vụ...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Chưa có nhiệm vụ nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">Nhiệm vụ</th>
                  <th className="px-4 py-3">Chu kỳ</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Mục tiêu / Điểm</th>
                  <th className="px-4 py-3">Thứ tự</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-500">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {task.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {task.actionType}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      <span className="font-semibold">{task.targetCount}</span> lần ·{' '}
                      <span className="font-semibold text-amber-700">+{task.points} điểm</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{task.sortOrder}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(task)}
                        className={cn(
                          'cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium',
                          task.active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                        )}
                      >
                        {task.active ? 'Đang bật' : 'Đang tắt'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(task)
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
                          onClick={() => void handleDelete(task)}
                          aria-label={`Xóa ${task.title}`}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskFormDialog
        open={dialogOpen}
        editing={editing}
        submitting={createTask.isPending || updateTask.isPending}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    </>
  )
}
