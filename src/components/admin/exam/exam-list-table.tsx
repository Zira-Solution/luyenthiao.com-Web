'use client'

import {
  Check,
  Copy,
  FileDown,
  FileUp,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState, type ChangeEvent, type ReactElement } from 'react'

import { AdminPageHeader } from '@/components/admin/shell'
import {
  useAdminExams,
  useAdminPlanets,
  useCreateAdminExam,
  useDeleteAdminExam,
  useToggleExamDemo,
} from '@/hooks/admin'
import { examSchema, exportExams } from '@/lib/exam'
import { createId } from '@/lib/exam-blank'
import { cn } from '@/lib/utils'
import type { Exam } from '@/types/exam'

const LEGACY_STORAGE_KEY = 'ela.exams.v1'

function readLegacyExamsFromStorage(): Exam[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => examSchema.safeParse(item))
      .filter((res) => res.success)
      .map((res) => res.data)
  } catch {
    return []
  }
}

export function ExamListTable(): ReactElement {
  const router = useRouter()
  const { data: exams = [], isLoading, error } = useAdminExams()
  const { data: planets = [] } = useAdminPlanets()
  const createExam = useCreateAdminExam()
  const deleteExam = useDeleteAdminExam()
  const toggleDemo = useToggleExamDemo()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [syncingLegacy, setSyncingLegacy] = useState(false)
  const [legacyExams, setLegacyExams] = useState<Exam[]>(() => readLegacyExamsFromStorage())

  const levelOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of planets) {
      map.set(p.slug, p.name || p.slug)
    }
    for (const e of exams) {
      if (e.levelSlug && !map.has(e.levelSlug)) {
        map.set(e.levelSlug, e.levelName || e.levelSlug)
      }
    }
    return Array.from(map.entries())
  }, [planets, exams])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredExams = exams.filter((exam) => {
    if (levelFilter && exam.levelSlug !== levelFilter) return false
    if (!normalizedQuery) return true
    const name = exam.name.toLowerCase()
    const id = exam.id.toLowerCase()
    const level = `${exam.levelName} ${exam.levelSlug}`.toLowerCase()
    return (
      name.includes(normalizedQuery) ||
      id.includes(normalizedQuery) ||
      level.includes(normalizedQuery)
    )
  })

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Xóa đề thi "${name}"?`)) return
    setActionError(null)
    try {
      await deleteExam.mutateAsync(id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được đề thi.')
    }
  }

  const handleDuplicate = async (exam: Exam) => {
    setActionError(null)
    const copy = JSON.parse(JSON.stringify(exam)) as Exam
    copy.id = createId('exam')
    copy.isDemo = false
    copy.name = `${exam.name || '(chưa đặt tên)'} (bản sao)`
    copy.structures = copy.structures.map((s) => ({ ...s, id: createId('s') }))
    try {
      await createExam.mutateAsync(copy)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không nhân bản được đề thi.')
    }
  }

  const handleToggleDemo = async (exam: Exam) => {
    setActionError(null)
    try {
      await toggleDemo.mutateAsync({ id: exam.id, isDemo: !exam.isDemo })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không cập nhật được trạng thái Demo.')
    }
  }

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setActionError(null)
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const list = Array.isArray(parsed) ? parsed : [parsed]
      let added = 0
      let skipped = 0
      for (const item of list) {
        const safe = examSchema.safeParse(item)
        if (!safe.success) {
          skipped += 1
          continue
        }
        await createExam.mutateAsync({ ...safe.data, id: createId('exam') })
        added += 1
      }
      window.alert(`Nhập xong: ${added} đề đã lưu lên máy chủ, ${skipped} đề sai định dạng bỏ qua.`)
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'File JSON không hợp lệ hoặc lỗi máy chủ.',
      )
    }
  }

  const handleSyncLegacy = async () => {
    if (legacyExams.length === 0 || syncingLegacy) return
    setSyncingLegacy(true)
    setActionError(null)
    try {
      for (const item of legacyExams) {
        await createExam.mutateAsync({ ...item, id: createId('exam') })
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      }
      setLegacyExams([])
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Đồng bộ dữ liệu trình duyệt thất bại.')
    } finally {
      setSyncingLegacy(false)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý đề thi"
        description="Tạo, sửa, xóa và quản lý đề demo, thứ tự hiển thị đồng bộ qua máy chủ."
        breadcrumbs={[{ label: 'Trang chủ', href: '/' }, { label: 'Đề thi' }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={createExam.isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <FileUp className="size-4" aria-hidden="true" />
              Nhập
            </button>
            <button
              type="button"
              onClick={() => exportExams(exams)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FileDown className="size-4" aria-hidden="true" />
              Xuất
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/exam/new')}
              className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="size-4" aria-hidden="true" />
              Tạo đề mới
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="hidden"
            />
          </>
        }
      />

      {legacyExams.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            Phát hiện {legacyExams.length} đề thi cũ lưu trong trình duyệt chưa đẩy lên máy chủ.
          </p>
          <button
            type="button"
            onClick={handleSyncLegacy}
            disabled={syncingLegacy}
            className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
          >
            {syncingLegacy && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            Đồng bộ lên máy chủ
          </button>
        </div>
      )}

      {(error || actionError) && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {actionError ??
            (error instanceof Error ? error.message : 'Không tải được danh sách đề thi.')}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500 shadow-xs">
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          Đang tải danh sách đề thi…
        </div>
      ) : exams.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-14 text-center shadow-xs">
          <p className="text-base font-semibold text-slate-800">Chưa có đề thi nào</p>
          <p className="mt-1.5 text-sm text-slate-500">
            Bấm &quot;Tạo đề mới&quot; để bắt đầu, hoặc &quot;Nhập&quot; để tải lên file JSON.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên đề, ID hoặc cấp độ…"
                  className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
                />
              </div>
              <select
                aria-label="Lọc theo hành tinh"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="focus:border-brand-primary focus:ring-brand-primary/20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:ring-2 focus:outline-none"
              >
                <option value="">Tất cả hành tinh</option>
                {levelOptions.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs font-medium text-slate-500">
              {filteredExams.length} / {exams.length} đề thi
            </span>
          </div>

          {filteredExams.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-xl text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Tên đề</th>
                    <th className="hidden px-5 py-3 md:table-cell">Cấp độ</th>
                    <th className="px-5 py-3">Cấu trúc</th>
                    <th className="px-5 py-3">Chế độ</th>
                    <th className="px-5 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredExams.map((exam) => {
                    const partCount = exam.structures.reduce((a, s) => a + s.parts.length, 0)
                    return (
                      <tr key={exam.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/exam/${exam.id}`)}
                            className="hover:text-admin-primary cursor-pointer text-left text-sm font-semibold text-slate-900 transition-colors"
                          >
                            {exam.name || '(chưa đặt tên)'}
                          </button>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-xs text-slate-500">
                            <span>{exam.id}</span>
                            {typeof exam.order === 'number' && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-sans text-[11px] font-medium text-slate-600">
                                Thứ tự #{exam.order}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-5 py-3.5 md:table-cell">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {exam.levelName || exam.levelSlug || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {exam.structures.map((s) => (
                              <span
                                key={s.id}
                                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700"
                              >
                                {s.name}
                                <span className="text-slate-500"> · {s.parts.length}</span>
                              </span>
                            ))}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">Tổng {partCount} phần</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            onClick={() => handleToggleDemo(exam)}
                            disabled={toggleDemo.isPending}
                            className={cn(
                              'inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
                              exam.isDemo
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
                            )}
                          >
                            <Sparkles className="size-3" aria-hidden="true" />
                            {exam.isDemo ? 'Demo' : 'Chuẩn (bật Demo)'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="Sửa"
                              aria-label={`Sửa ${exam.name}`}
                              onClick={() => router.push(`/admin/exam/${exam.id}`)}
                              className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              title="Nhân bản"
                              aria-label={`Nhân bản ${exam.name}`}
                              disabled={createExam.isPending}
                              onClick={() => handleDuplicate(exam)}
                              className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                            >
                              <Copy className="size-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              title="Xóa"
                              aria-label={`Xóa ${exam.name}`}
                              disabled={deleteExam.isPending}
                              onClick={() => handleRemove(exam.id, exam.name)}
                              className={cn(
                                'flex size-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50',
                              )}
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
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
      )}

      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Check className="size-4 text-emerald-600" aria-hidden="true" />
        Dữ liệu đồng bộ trực tiếp với máy chủ <code className="font-mono">/api/exams</code>.
      </div>
    </>
  )
}
