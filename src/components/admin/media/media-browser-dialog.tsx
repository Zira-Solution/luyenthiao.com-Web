'use client'

import { Check, Cloud, FolderOpen, Loader2, Music, Search, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, type ChangeEvent, type ReactElement } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui'
import { useDeleteR2Upload, useR2Uploads, useUploadR2File } from '@/hooks/admin'
import { useMediaLibrary } from '@/hooks/use-media-library'
import type { MediaItem, MediaKind } from '@/lib/admin-media'
import { listR2Uploads } from '@/lib/api/admin'
import { cn } from '@/lib/utils'
import type { R2UploadItem } from '@/schemas/admin-upload'

export interface MediaBrowserDialogProps {
  kind: MediaKind
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string | null | undefined
  onSelect: (path: string) => void
}

type LibraryTab = 'r2' | 'builtin'

const PAGE = 24

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function MediaBrowserDialog({
  kind,
  open,
  onOpenChange,
  value,
  onSelect,
}: MediaBrowserDialogProps): ReactElement {
  const [tab, setTab] = useState<LibraryTab>('r2')
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(PAGE)
  const [extraR2, setExtraR2] = useState<{
    kind: MediaKind
    items: R2UploadItem[]
    nextCursor: string | null
  } | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    data: r2Data,
    isLoading: r2Loading,
    error: r2Error,
  } = useR2Uploads({ type: kind }, open && tab === 'r2')
  const uploadMutation = useUploadR2File()
  const deleteMutation = useDeleteR2Upload()
  const {
    data: builtinData,
    isLoading: builtinLoading,
    error: builtinError,
  } = useMediaLibrary(kind)

  const q = search.trim().toLowerCase()

  const baseR2Items = r2Data?.items ?? []
  const mergedR2Items =
    extraR2 && extraR2.kind === kind ? [...baseR2Items, ...extraR2.items] : baseR2Items
  const currentCursor =
    extraR2 && extraR2.kind === kind ? extraR2.nextCursor : (r2Data?.nextCursor ?? null)
  const filteredR2 = mergedR2Items.filter((item) =>
    q ? item.name.toLowerCase().includes(q) || item.key.toLowerCase().includes(q) : true,
  )

  const filteredBuiltin = (builtinData ?? []).filter((item) =>
    q ? item.name.toLowerCase().includes(q) || item.dir.toLowerCase().includes(q) : true,
  )
  const shownBuiltin = filteredBuiltin.slice(0, visible)

  const handleSelect = (path: string) => {
    onSelect(path)
    onOpenChange(false)
  }

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setActionError(null)
    try {
      const uploaded = await uploadMutation.mutateAsync(file)
      setExtraR2(null)
      handleSelect(uploaded.url)
    } catch (err) {
      setActionError(toErrorMessage(err, 'Tải file lên R2 thất bại.'))
    }
  }

  const handleDeleteR2 = async (item: R2UploadItem) => {
    if (!window.confirm(`Xóa vĩnh viễn file "${item.name}" khỏi Cloudflare R2?`)) return
    setActionError(null)
    try {
      await deleteMutation.mutateAsync(item.key)
      setExtraR2((prev) =>
        prev && prev.kind === kind
          ? { ...prev, items: prev.items.filter((x) => x.key !== item.key) }
          : prev,
      )
    } catch (err) {
      setActionError(toErrorMessage(err, 'Không xóa được file trên R2.'))
    }
  }

  const handleLoadMoreR2 = async () => {
    if (!currentCursor || loadingMore) return
    setLoadingMore(true)
    setActionError(null)
    try {
      const nextPage = await listR2Uploads({ type: kind, cursor: currentCursor })
      setExtraR2((prev) => ({
        kind,
        items: prev && prev.kind === kind ? [...prev.items, ...nextPage.items] : nextPage.items,
        nextCursor: nextPage.nextCursor,
      }))
    } catch (err) {
      setActionError(toErrorMessage(err, 'Không tải thêm được danh sách R2.'))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme max-w-2xl border border-slate-200 bg-white text-slate-900 shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-sans text-base font-semibold tracking-normal text-slate-900">
            {kind === 'image' ? 'Thư viện ảnh' : 'Thư viện âm thanh'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div role="tablist" aria-label="Nguồn media" className="flex items-center gap-1.5">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'r2'}
              onClick={() => {
                setTab('r2')
                setActionError(null)
              }}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                tab === 'r2'
                  ? 'bg-admin-primary text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
              )}
            >
              <Cloud className="size-3.5" aria-hidden="true" />
              Kho R2 (Cloud)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'builtin'}
              onClick={() => {
                setTab('builtin')
                setActionError(null)
              }}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                tab === 'builtin'
                  ? 'bg-admin-primary text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
              )}
            >
              <FolderOpen className="size-3.5" aria-hidden="true" />
              Tài nguyên sẵn
            </button>
          </div>

          {tab === 'r2' && (
            <div className="flex items-center gap-2">
              <span className="hidden text-[11px] text-slate-500 sm:inline">
                {kind === 'image' ? 'PNG/JPG/WEBP ≤ 2MB' : 'MP3/OGG/WAV/M4A/WEBM ≤ 20MB'}
              </span>
              <button
                type="button"
                disabled={r2Data?.configured === false || uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-3.5" aria-hidden="true" />
                )}
                Tải lên R2
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  kind === 'image'
                    ? 'image/png,image/jpeg,image/webp'
                    : 'audio/mpeg,audio/ogg,audio/wav,audio/mp4,audio/webm'
                }
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          )}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisible(PAGE)
            }}
            placeholder="Tìm theo tên file hoặc thư mục…"
            className="focus:border-brand-primary focus:ring-brand-primary/20 w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:outline-none"
          />
        </div>

        {actionError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {actionError}
          </div>
        )}

        {tab === 'r2' ? (
          <>
            {r2Loading && (
              <div className="py-10 text-center text-sm text-slate-500">Đang tải kho R2…</div>
            )}
            {r2Error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Không tải được danh sách file trên R2.
              </div>
            )}
            {!r2Loading && !r2Error && r2Data && !r2Data.configured && (
              <div className="flex flex-col items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-medium">
                  Chưa cấu hình Cloudflare R2 trên máy chủ (thiếu khóa truy cập). Bạn vẫn có thể
                  dùng tab Tài nguyên sẵn hoặc dán URL trực tiếp.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('builtin')}
                  className="cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100"
                >
                  Mở Tài nguyên sẵn
                </button>
              </div>
            )}
            {!r2Loading && !r2Error && r2Data?.configured && filteredR2.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">
                Chưa có file nào phù hợp trên R2. Hãy bấm &quot;Tải lên R2&quot; để thêm mới.
              </div>
            )}

            {r2Data?.configured &&
              filteredR2.length > 0 &&
              (kind === 'image' ? (
                <div className="grid max-h-[45vh] grid-cols-3 gap-2.5 overflow-auto pr-1 sm:grid-cols-4">
                  {filteredR2.map((item) => (
                    <div key={item.key} className="group relative aspect-square">
                      <button
                        type="button"
                        aria-label={item.name}
                        onClick={() => handleSelect(item.url)}
                        className={cn(
                          'relative size-full cursor-pointer overflow-hidden rounded-lg border bg-slate-50 transition-colors',
                          value === item.url
                            ? 'border-admin-primary ring-admin-primary/20 bg-blue-50/40 ring-2'
                            : 'border-slate-200 hover:border-slate-400',
                        )}
                      >
                        <Image
                          src={item.url}
                          alt={item.name}
                          fill
                          sizes="120px"
                          unoptimized
                          className="object-contain p-1.5"
                        />
                        {value === item.url && (
                          <span className="bg-admin-primary absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full text-white shadow-xs">
                            <Check className="size-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteR2(item)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Xóa ${item.name}`}
                        title="Xóa trên R2"
                        className="absolute bottom-1.5 left-1.5 hidden cursor-pointer rounded-md border border-rose-200 bg-white p-1 text-rose-700 shadow-xs transition-colors group-hover:flex hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex max-h-[45vh] flex-col gap-2 overflow-auto pr-1">
                  {filteredR2.map((item) => (
                    <div key={item.key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className={cn(
                          'flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                          value === item.url
                            ? 'border-admin-primary ring-admin-primary/20 bg-blue-50/50 ring-1'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                        )}
                      >
                        <span className="shrink-0 text-slate-500">
                          <Music className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-900">
                            {item.name}
                          </div>
                          <div className="truncate text-xs text-slate-500">{item.key}</div>
                        </div>
                        {value === item.url && (
                          <span className="bg-admin-primary grid size-5 shrink-0 place-items-center rounded-full text-white">
                            <Check className="size-3.5" aria-hidden="true" />
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteR2(item)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Xóa ${item.name}`}
                        title="Xóa trên R2"
                        className="cursor-pointer rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ))}

            {currentCursor && (
              <button
                type="button"
                disabled={loadingMore}
                onClick={handleLoadMoreR2}
                className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {loadingMore ? 'Đang tải thêm…' : 'Tải thêm từ R2'}
              </button>
            )}
          </>
        ) : (
          <>
            {builtinLoading && (
              <div className="py-10 text-center text-sm text-slate-500">Đang tải thư viện…</div>
            )}
            {builtinError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                Không tải được thư viện. Hãy chắc chắn files nằm trong{' '}
                <code className="font-mono text-xs text-rose-800">public/clone-assets</code>.
              </div>
            )}
            {!builtinLoading && !builtinError && shownBuiltin.length === 0 && (
              <div className="py-10 text-center text-sm text-slate-500">Không có file phù hợp.</div>
            )}

            {kind === 'image' ? (
              <div className="grid max-h-[45vh] grid-cols-3 gap-2.5 overflow-auto pr-1 sm:grid-cols-4">
                {shownBuiltin.map((item) => (
                  <ImageCard
                    key={item.path}
                    item={item}
                    active={value === item.path}
                    onSelect={() => handleSelect(item.path)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex max-h-[45vh] flex-col gap-2 overflow-auto pr-1">
                {shownBuiltin.map((item) => (
                  <AudioRow
                    key={item.path}
                    item={item}
                    active={value === item.path}
                    onSelect={() => handleSelect(item.path)}
                  />
                ))}
              </div>
            )}

            {filteredBuiltin.length > visible && (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Tải thêm ({filteredBuiltin.length - visible} còn lại)
              </button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ImageCard({
  item,
  active,
  onSelect,
}: {
  item: MediaItem
  active: boolean
  onSelect: () => void
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative aspect-square cursor-pointer overflow-hidden rounded-lg border bg-slate-50 transition-colors',
        active
          ? 'border-admin-primary ring-admin-primary/20 bg-blue-50/40 ring-2'
          : 'border-slate-200 hover:border-slate-400',
      )}
    >
      <Image src={item.path} alt={item.name} fill sizes="120px" className="object-contain p-1.5" />
      {active && (
        <span className="bg-admin-primary absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full text-white shadow-xs">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
      )}
    </button>
  )
}

function AudioRow({
  item,
  active,
  onSelect,
}: {
  item: MediaItem
  active: boolean
  onSelect: () => void
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
        active
          ? 'border-admin-primary ring-admin-primary/20 bg-blue-50/50 ring-1'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      <span className="shrink-0 text-slate-500">
        <Music className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900">{item.name}</div>
        <div className="truncate text-xs text-slate-500">{item.dir}</div>
      </div>
      {active && (
        <span className="bg-admin-primary grid size-5 shrink-0 place-items-center rounded-full text-white">
          <Check className="size-3.5" aria-hidden="true" />
        </span>
      )}
    </button>
  )
}
