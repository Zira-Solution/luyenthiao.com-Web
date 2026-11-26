'use client'

import { Loader2, X } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { MediaPickerField } from '@/components/admin/media'
import type { AdminPlanet, SaveAdminPlanetInput } from '@/schemas/admin-planet'

export interface PlanetFormDialogProps {
  open: boolean
  editing: AdminPlanet | null
  submitting: boolean
  onClose: () => void
  onSave: (input: SaveAdminPlanetInput, editingId?: string) => Promise<void>
}

const SLUG_RE = /^[a-z0-9_]{1,64}$/
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function PlanetFormDialog(props: PlanetFormDialogProps): ReactElement | null {
  if (!props.open) return null
  return <PlanetFormDialogInner key={props.editing?.id ?? 'new'} {...props} />
}

function PlanetFormDialogInner({
  editing,
  submitting,
  onClose,
  onSave,
}: PlanetFormDialogProps): ReactElement {
  const [slug, setSlug] = useState(() => editing?.slug ?? '')
  const [name, setName] = useState(() => editing?.name ?? '')
  const [nameEn, setNameEn] = useState(() => (editing ? editing.nameEn || editing.name : ''))
  const [subtitle, setSubtitle] = useState(() => editing?.subtitle || '')
  const [subtitleEn, setSubtitleEn] = useState(() => editing?.subtitleEn || '')
  const [level, setLevel] = useState(() => editing?.level || '')
  const [image, setImage] = useState<string>(() => editing?.image || '')
  const [mapBackground, setMapBackground] = useState<string>(() => editing?.mapBackground || '')
  const [linkUrl, setLinkUrl] = useState(() => editing?.linkUrl || '')
  const [mapTotal, setMapTotal] = useState(() => String(editing?.mapTotal ?? 200))
  const [glowColor, setGlowColor] = useState(() => editing?.glowColor || '#7c3aed')
  const [ribbonFrom, setRibbonFrom] = useState(() => editing?.ribbonFrom || '#f472b6')
  const [ribbonTo, setRibbonTo] = useState(() => editing?.ribbonTo || '#f43f5e')
  const [visible, setVisible] = useState(() => editing?.visible ?? true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const cleanSlug = slug.trim().toLowerCase()
    if (!editing && !SLUG_RE.test(cleanSlug)) {
      setErrorMsg('Slug chỉ gồm a-z, 0-9 và dấu gạch dưới (_), tối đa 64 ký tự.')
      return
    }
    if (!name.trim()) {
      setErrorMsg('Tên hành tinh không được để trống.')
      return
    }
    if (
      !HEX_RE.test(glowColor.trim()) ||
      !HEX_RE.test(ribbonFrom.trim()) ||
      !HEX_RE.test(ribbonTo.trim())
    ) {
      setErrorMsg('Mã màu glow / ribbon phải theo định dạng hex hợp lệ, ví dụ #7c3aed.')
      return
    }
    const parsedTotal = Number.parseInt(mapTotal, 10)
    if (!Number.isFinite(parsedTotal) || parsedTotal < 1 || parsedTotal > 1000) {
      setErrorMsg('mapTotal phải nằm trong khoảng từ 1 đến 1000.')
      return
    }

    try {
      await onSave(
        {
          slug: editing ? editing.slug : cleanSlug,
          name: name.trim(),
          nameEn: nameEn.trim() || name.trim(),
          subtitle: subtitle.trim(),
          subtitleEn: subtitleEn.trim(),
          level: level.trim(),
          image: image.trim(),
          mapBackground: mapBackground.trim(),
          linkUrl: linkUrl.trim(),
          mapTotal: parsedTotal,
          glowColor: glowColor.trim(),
          ribbonFrom: ribbonFrom.trim(),
          ribbonTo: ribbonTo.trim(),
          visible,
        },
        editing?.id,
      )
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không lưu được hành tinh.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Chỉnh sửa hành tinh' : 'Thêm hành tinh mới'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-800/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {editing ? `Chỉnh sửa hành tinh (${editing.slug})` : 'Thêm hành tinh mới'}
          </h2>
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
                htmlFor="planet-slug"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Slug định danh {editing ? '(khóa khi sửa)' : '*'}
              </label>
              <input
                id="planet-slug"
                type="text"
                value={slug}
                disabled={Boolean(editing)}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="VD: starters hoặc galaxy_1"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-level"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Nhãn trình độ (level)
              </label>
              <input
                id="planet-level"
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="VD: Pre A1, A1, B1..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-name"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Tên hành tinh (VI) *
              </label>
              <input
                id="planet-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: STARTERS"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-name-en"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Tên hành tinh (EN)
              </label>
              <input
                id="planet-name-en"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="VD: STARTERS"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-sub"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Phụ đề hiển thị (VI)
              </label>
              <input
                id="planet-sub"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="VD: Hòn Đảo Kẹo Ngọt"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-sub-en"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Phụ đề (EN)
              </label>
              <input
                id="planet-sub-en"
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder="VD: Sweet Candy Island"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-link"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Đường dẫn tùy chỉnh (linkUrl)
              </label>
              <input
                id="planet-link"
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Để trống để dùng /testlevels/<slug>"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="planet-total"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Tổng điểm map (mapTotal)
              </label>
              <input
                id="planet-total"
                type="number"
                min={1}
                max={1000}
                value={mapTotal}
                onChange={(e) => setMapTotal(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-700">Ảnh hành tinh</p>
              <MediaPickerField kind="image" value={image} onChange={(v) => setImage(v ?? '')} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-700">Ảnh nền bản đồ</p>
              <MediaPickerField
                kind="image"
                value={mapBackground}
                onChange={(v) => setMapBackground(v ?? '')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="planet-glow"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Màu hào quang (glowColor)
              </label>
              <input
                id="planet-glow"
                type="text"
                value={glowColor}
                onChange={(e) => setGlowColor(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900"
              />
            </div>
            <div>
              <label
                htmlFor="planet-from"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Màu ruy-băng đầu
              </label>
              <input
                id="planet-from"
                type="text"
                value={ribbonFrom}
                onChange={(e) => setRibbonFrom(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900"
              />
            </div>
            <div>
              <label
                htmlFor="planet-to"
                className="mb-1 block text-xs font-semibold text-slate-700"
              >
                Màu ruy-băng cuối
              </label>
              <input
                id="planet-to"
                type="text"
                value={ribbonTo}
                onChange={(e) => setRibbonTo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900"
              />
            </div>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600"
            />
            Hiển thị trên trang chủ học viên
          </label>

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
              className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editing ? 'Lưu thay đổi' : 'Tạo hành tinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
