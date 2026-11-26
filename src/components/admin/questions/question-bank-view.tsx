'use client'

import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { QuestionFormDialog } from './question-form-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminPlanets,
  useAdminQuestions,
  useCreateAdminQuestion,
  useDeleteAdminQuestion,
  useUpdateAdminQuestion,
} from '@/hooks/admin'
import {
  QUESTION_KINDS,
  SKILL_TAGS,
  type AdminQuestion,
  type SaveAdminQuestionInput,
} from '@/schemas/admin-question'

const PAGE_LIMIT = 20

function questionSummary(item: AdminQuestion): string {
  const q = item.question
  if (typeof q.title === 'string' && q.title.trim()) return q.title
  if (typeof q.instruction === 'string' && q.instruction.trim()) return q.instruction
  if (typeof q.text === 'string' && q.text.trim()) return q.text
  if (typeof q.promptHtml === 'string' && q.promptHtml.trim()) return q.promptHtml
  return JSON.stringify(q).slice(0, 100)
}

export function QuestionBankView(): ReactElement {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [skill, setSkill] = useState('')
  const [kind, setKind] = useState('')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminQuestion | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminQuestions({
    level: level || undefined,
    skill: skill || undefined,
    kind: kind || undefined,
    q: search.trim() || undefined,
    page,
    limit: PAGE_LIMIT,
  })
  const { data: planets = [] } = useAdminPlanets()
  const createQuestion = useCreateAdminQuestion()
  const updateQuestion = useUpdateAdminQuestion()
  const deleteQuestion = useDeleteAdminQuestion()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const handleOpenCreate = () => {
    setEditing(null)
    setActionError(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (item: AdminQuestion) => {
    setEditing(item)
    setActionError(null)
    setDialogOpen(true)
  }

  const handleSave = async (payload: SaveAdminQuestionInput, editingId?: string) => {
    if (editingId) {
      await updateQuestion.mutateAsync({ id: editingId, input: payload })
    } else {
      await createQuestion.mutateAsync(payload)
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = async (item: AdminQuestion) => {
    if (!window.confirm(`Xóa câu hỏi "${questionSummary(item)}" khỏi kho?`)) return
    setActionError(null)
    try {
      await deleteQuestion.mutateAsync(item.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được câu hỏi.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Kho câu hỏi"
        description="Quản lý câu hỏi dùng chung giữa các đề thi, lọc theo hành tinh, kỹ năng và dạng câu."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Kho câu hỏi' }]}
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="size-4" aria-hidden="true" />
            Tạo câu hỏi
          </button>
        }
      />

      {(error || actionError) && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được kho câu hỏi.')}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Tìm nội dung câu hỏi…"
                className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
              />
            </div>

            <select
              aria-label="Lọc hành tinh"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value)
                setPage(1)
              }}
              className="focus:border-brand-primary rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
            >
              <option value="">Tất cả hành tinh</option>
              {planets.map((p) => (
                <option key={p.id} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc kỹ năng"
              value={skill}
              onChange={(e) => {
                setSkill(e.target.value)
                setPage(1)
              }}
              className="focus:border-brand-primary rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
            >
              <option value="">Tất cả kỹ năng</option>
              {SKILL_TAGS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc loại câu"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value)
                setPage(1)
              }}
              className="focus:border-brand-primary rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none"
            >
              <option value="">Tất cả dạng câu</option>
              {QUESTION_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-medium text-slate-500">{total} câu hỏi</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-14 text-sm text-slate-500">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Đang tải kho câu hỏi…
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-slate-800">Chưa có câu hỏi phù hợp</p>
            <p className="mt-1 text-xs text-slate-500">
              Lưu đề thi sẽ tự động lập chỉ mục câu hỏi vào kho, hoặc bấm &quot;Tạo câu hỏi&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-xl text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Nội dung</th>
                  <th className="px-5 py-3">Hành tinh</th>
                  <th className="px-5 py-3">Loại</th>
                  <th className="px-5 py-3">Kỹ năng</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50">
                    <td className="max-w-md px-5 py-3.5">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {questionSummary(item)}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{item.id}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {item.levelSlug || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {item.kind || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {item.skillTags.length === 0 ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          item.skillTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            >
                              {tag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          aria-label={`Sửa ${item.id}`}
                          onClick={() => handleOpenEdit(item)}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Pencil className="size-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa ${item.id}`}
                          disabled={deleteQuestion.isPending}
                          onClick={() => handleDelete(item)}
                          className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_LIMIT && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600">
            <span>
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40"
              >
                Sau
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      <QuestionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        planets={planets}
        isSubmitting={createQuestion.isPending || updateQuestion.isPending}
        onSubmit={handleSave}
      />
    </>
  )
}
