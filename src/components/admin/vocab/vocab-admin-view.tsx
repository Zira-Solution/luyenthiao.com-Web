'use client'

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Volume2,
} from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { VocabFormDialog } from './vocab-form-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminPlanets,
  useAdminVocab,
  useCreateAdminVocab,
  useDeleteAdminVocab,
  useUpdateAdminVocab,
} from '@/hooks/admin'
import type { AdminVocabWord, SaveAdminVocabInput } from '@/schemas/admin-vocab'

const PAGE_LIMIT = 20

export function VocabAdminView(): ReactElement {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('all')
  const [topic, setTopic] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all')
  const [page, setPage] = useState(1)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminVocabWord | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, isLoading, error } = useAdminVocab({
    level: level === 'all' ? undefined : level,
    topic: topic.trim() || undefined,
    active: activeFilter === 'all' ? undefined : activeFilter === 'true',
    q: search.trim() || undefined,
    page,
    limit: PAGE_LIMIT,
  })
  const { data: planets = [] } = useAdminPlanets()
  const createVocab = useCreateAdminVocab()
  const updateVocab = useUpdateAdminVocab()
  const deleteVocab = useDeleteAdminVocab()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const playAudio = (url: string) => {
    setActionError(null)
    if (!url || (!url.startsWith('/') && !/^https?:\/\//i.test(url))) return
    try {
      const audio = new Audio(url)
      void audio.play().catch(() => {
        setActionError('Trình duyệt không phát được file âm thanh này.')
      })
    } catch {
      setActionError('Không phát được audio.')
    }
  }

  const handleSave = async (input: SaveAdminVocabInput, editingId?: number) => {
    if (editingId) {
      await updateVocab.mutateAsync({ id: editingId, input })
    } else {
      await createVocab.mutateAsync(input)
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = async (item: AdminVocabWord) => {
    if (!window.confirm(`Xóa từ vựng "${item.word}"?`)) return
    setActionError(null)
    try {
      await deleteVocab.mutateAsync(item.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được từ vựng.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản lý Từ vựng"
        description="Quản lý kho từ vựng tra cứu, lọc theo cấp độ/chủ đề/trạng thái và gắn âm thanh R2."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Từ vựng' }]}
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
            Thêm từ vựng
          </button>
        }
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được từ vựng.')}
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
              placeholder="Tìm từ tiếng Anh, nghĩa, chủ đề..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500"
            />
          </div>

          <select
            aria-label="Lọc theo cấp độ"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value)
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="all">Mọi cấp độ</option>
            {planets.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name} ({p.slug})
              </option>
            ))}
          </select>

          <input
            type="text"
            aria-label="Lọc theo chủ đề"
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              setPage(1)
            }}
            placeholder="Chủ đề (topic)..."
            className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-500"
          />

          <select
            aria-label="Lọc trạng thái"
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as 'all' | 'true' | 'false')
              setPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="true">Đang bật</option>
            <option value="false">Đang tắt</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải từ vựng...
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">
            Không có từ vựng nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">Từ / IPA</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Nghĩa tiếng Việt</th>
                  <th className="px-4 py-3">Cấp độ / Chủ đề</th>
                  <th className="px-4 py-3">Audio</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.word}</p>
                      {item.ipa && <p className="text-xs text-slate-500">{item.ipa}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.meaningVi}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <span className="font-semibold uppercase">{item.level}</span>
                      {item.topic ? ` · ${item.topic}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      {item.audioUrl ? (
                        <button
                          type="button"
                          onClick={() => playAudio(item.audioUrl)}
                          aria-label={`Nghe phát âm ${item.word}`}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                          <Volume2 className="size-3.5" aria-hidden="true" />
                          Nghe
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.active ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Đang bật
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          Đang tắt
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item)
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
                          onClick={() => void handleDelete(item)}
                          aria-label={`Xóa ${item.word}`}
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

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <span>
            Tổng {total} từ · Trang {page}/{totalPages}
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

      <VocabFormDialog
        open={dialogOpen}
        editing={editing}
        submitting={createVocab.isPending || updateVocab.isPending}
        levelOptions={planets.map((p) => ({ slug: p.slug, name: p.name }))}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    </>
  )
}
