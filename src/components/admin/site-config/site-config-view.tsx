'use client'

import { Loader2, RotateCcw, Save } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { DEFAULT_SITE_CONFIG_CLIENT } from './site-config-defaults'

import { MediaPickerField } from '@/components/admin/media'
import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminSiteConfig, useSaveAdminSiteConfig } from '@/hooks/admin'
import { cn } from '@/lib/utils'
import type { AdminSiteConfig } from '@/schemas/admin-site-config'

type SectionTab =
  | 'homeAssets'
  | 'globalAssets'
  | 'authAssets'
  | 'mapAssets'
  | 'mapTexts'
  | 'languages'
  | 'speakingAssets'
  | 'writingAssets'
  | 'challengeAssets'
  | 'checkpointAssets'
  | 'json'

const TABS: { id: SectionTab; label: string }[] = [
  { id: 'homeAssets', label: 'Trang chủ' },
  { id: 'globalAssets', label: 'Toàn hệ thống' },
  { id: 'authAssets', label: 'Đăng nhập' },
  { id: 'mapAssets', label: 'Bản đồ (Ảnh)' },
  { id: 'mapTexts', label: 'Bản đồ (Chữ)' },
  { id: 'languages', label: 'Ngôn ngữ' },
  { id: 'speakingAssets', label: 'Speaking' },
  { id: 'writingAssets', label: 'Writing' },
  { id: 'challengeAssets', label: 'Đấu trường' },
  { id: 'checkpointAssets', label: 'Phòng thi' },
  { id: 'json', label: 'JSON tổng hợp' },
]

function mergeWithDefaults(remote?: AdminSiteConfig): AdminSiteConfig {
  const def = DEFAULT_SITE_CONFIG_CLIENT
  if (!remote) return def
  return {
    mapAssets: { ...def.mapAssets, ...remote.mapAssets },
    mapTexts: { ...def.mapTexts, ...remote.mapTexts },
    languages: remote.languages.length > 0 ? remote.languages : def.languages,
    defaultLanguage: remote.defaultLanguage ?? def.defaultLanguage,
    globalAssets: { ...def.globalAssets, ...remote.globalAssets },
    authAssets: { ...def.authAssets, ...remote.authAssets },
    homeAssets: {
      background: remote.homeAssets?.background || def.homeAssets.background,
      topbarIcons: { ...def.homeAssets.topbarIcons, ...remote.homeAssets?.topbarIcons },
      bottomNavIcons: { ...def.homeAssets.bottomNavIcons, ...remote.homeAssets?.bottomNavIcons },
    },
    speakingAssets: { ...def.speakingAssets, ...remote.speakingAssets },
    writingAssets: { ...def.writingAssets, ...remote.writingAssets },
    challengeAssets: { ...def.challengeAssets, ...remote.challengeAssets },
    checkpointAssets: { ...def.checkpointAssets, ...remote.checkpointAssets },
  }
}

export function SiteConfigView(): ReactElement {
  const { data, isLoading, error } = useAdminSiteConfig()
  const [tab, setTab] = useState<SectionTab>('homeAssets')

  return (
    <SiteConfigEditor
      key={data ? 'loaded' : 'empty'}
      initialConfig={mergeWithDefaults(data)}
      isLoading={isLoading}
      error={error}
      tab={tab}
      onTabChange={setTab}
    />
  )
}

function SiteConfigEditor({
  initialConfig,
  isLoading,
  error,
  tab,
  onTabChange: setTab,
}: {
  initialConfig: AdminSiteConfig
  isLoading: boolean
  error: unknown
  tab: SectionTab
  onTabChange: (tab: SectionTab) => void
}): ReactElement {
  const saveMutation = useSaveAdminSiteConfig()

  const [draft, setDraft] = useState<AdminSiteConfig>(initialConfig)
  const [jsonText, setJsonText] = useState(() => JSON.stringify(initialConfig, null, 2))
  const [notice, setNotice] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const updateFlatMap = (
    key:
      | 'mapAssets'
      | 'globalAssets'
      | 'authAssets'
      | 'speakingAssets'
      | 'writingAssets'
      | 'challengeAssets'
      | 'checkpointAssets',
    field: string,
    val: string,
  ) => {
    setDraft((prev) => {
      const next = { ...prev, [key]: { ...prev[key], [field]: val } }
      setJsonText(JSON.stringify(next, null, 2))
      return next
    })
  }

  const handleResetSection = () => {
    if (tab === 'json') {
      setDraft(DEFAULT_SITE_CONFIG_CLIENT)
      setJsonText(JSON.stringify(DEFAULT_SITE_CONFIG_CLIENT, null, 2))
      return
    }
    setDraft((prev) => {
      const next = { ...prev, [tab]: DEFAULT_SITE_CONFIG_CLIENT[tab] }
      if (tab === 'languages') {
        next.defaultLanguage = DEFAULT_SITE_CONFIG_CLIENT.defaultLanguage
      }
      setJsonText(JSON.stringify(next, null, 2))
      return next
    })
    setNotice('Đã đặt lại phần đang chọn về mặc định (chưa lưu máy chủ).')
  }

  const handleSave = async () => {
    setNotice(null)
    setErrorMsg(null)
    let payload = draft
    if (tab === 'json') {
      try {
        payload = JSON.parse(jsonText) as AdminSiteConfig
        setDraft(payload)
      } catch {
        setErrorMsg('JSON tổng hợp chưa hợp lệ — vui lòng kiểm tra cú pháp trước khi lưu.')
        return
      }
    }
    try {
      await saveMutation.mutateAsync(payload)
      setNotice('Đã lưu cấu hình trang chủ lên máy chủ.')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không lưu được cấu hình.')
    }
  }

  const flatAssetSection =
    tab === 'mapAssets' ||
    tab === 'globalAssets' ||
    tab === 'authAssets' ||
    tab === 'speakingAssets' ||
    tab === 'writingAssets' ||
    tab === 'challengeAssets' ||
    tab === 'checkpointAssets'
      ? tab
      : null

  return (
    <>
      <AdminPageHeader
        title="Cấu hình Trang chủ & Tài nguyên"
        description="Điều chỉnh 11 nhóm hình ảnh, icon, ngôn ngữ và nhãn giao diện đồng bộ qua /api/site-config."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Cấu hình trang chủ' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetSection}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Mặc định mục này
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending}
              onClick={() => void handleSave()}
              className="bg-admin-primary hover:bg-admin-primary-hover inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-xs disabled:opacity-60"
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              Lưu cấu hình
            </button>
          </div>
        }
      />

      {(error || errorMsg) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {errorMsg ?? (error instanceof Error ? error.message : 'Lỗi tải cấu hình.')}
        </div>
      )}

      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                tab === t.id
                  ? 'bg-admin-primary text-white shadow-xs'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải cấu hình...
          </div>
        ) : (
          <div className="p-5">
            {flatAssetSection && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(draft[flatAssetSection]).map(([field, val]) => (
                  <div key={field} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-700">{field}</p>
                    <MediaPickerField
                      kind="image"
                      value={val}
                      onChange={(next) => updateFlatMap(flatAssetSection, field, next ?? '')}
                    />
                  </div>
                ))}
              </div>
            )}

            {tab === 'homeAssets' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-slate-700">background</p>
                  <MediaPickerField
                    kind="image"
                    value={draft.homeAssets.background}
                    onChange={(v) =>
                      setDraft((prev) => ({
                        ...prev,
                        homeAssets: { ...prev.homeAssets, background: v ?? '' },
                      }))
                    }
                  />
                </div>

                <div>
                  <h3 className="mb-2.5 text-sm font-semibold text-slate-800">
                    Icon thanh Topbar (topbarIcons)
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(draft.homeAssets.topbarIcons).map(([field, val]) => (
                      <div
                        key={field}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="mb-2 text-xs font-semibold text-slate-700">{field}</p>
                        <MediaPickerField
                          kind="image"
                          value={val}
                          onChange={(v) =>
                            setDraft((prev) => ({
                              ...prev,
                              homeAssets: {
                                ...prev.homeAssets,
                                topbarIcons: { ...prev.homeAssets.topbarIcons, [field]: v ?? '' },
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2.5 text-sm font-semibold text-slate-800">
                    Icon thanh dưới (bottomNavIcons)
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(draft.homeAssets.bottomNavIcons).map(([field, val]) => (
                      <div
                        key={field}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="mb-2 text-xs font-semibold text-slate-700">{field}</p>
                        <MediaPickerField
                          kind="image"
                          value={val}
                          onChange={(v) =>
                            setDraft((prev) => ({
                              ...prev,
                              homeAssets: {
                                ...prev.homeAssets,
                                bottomNavIcons: {
                                  ...prev.homeAssets.bottomNavIcons,
                                  [field]: v ?? '',
                                },
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'mapTexts' && (
              <div className="space-y-3">
                {Object.entries(draft.mapTexts).map(([key, pair]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[140px_1fr_1fr]"
                  >
                    <span className="self-center text-xs font-semibold text-slate-700">{key}</span>
                    <input
                      type="text"
                      value={pair.vi}
                      aria-label={`${key} tiếng Việt`}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          mapTexts: {
                            ...prev.mapTexts,
                            [key]: { ...pair, vi: e.target.value },
                          },
                        }))
                      }
                      placeholder="Tiếng Việt"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                    <input
                      type="text"
                      value={pair.en}
                      aria-label={`${key} tiếng Anh`}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          mapTexts: {
                            ...prev.mapTexts,
                            [key]: { ...pair, en: e.target.value },
                          },
                        }))
                      }
                      placeholder="English"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {tab === 'languages' && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="default-lang-select"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Ngôn ngữ mặc định (defaultLanguage)
                  </label>
                  <select
                    id="default-lang-select"
                    value={draft.defaultLanguage}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        defaultLanguage: e.target.value === 'en' ? 'en' : 'vi',
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="vi">Tiếng Việt (vi)</option>
                    <option value="en">English (en)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {draft.languages.map((lang, idx) => (
                    <div
                      key={lang.code}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2"
                    >
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-700">
                          Nhãn ({lang.code})
                        </p>
                        <input
                          type="text"
                          value={lang.label}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              languages: prev.languages.map((l, i) =>
                                i === idx ? { ...l, label: e.target.value } : l,
                              ),
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold text-slate-700">Ảnh cờ tùy chọn</p>
                        <MediaPickerField
                          kind="image"
                          value={lang.flagImage ?? ''}
                          onChange={(v) =>
                            setDraft((prev) => ({
                              ...prev,
                              languages: prev.languages.map((l, i) =>
                                i === idx ? { ...l, flagImage: v ?? '' } : l,
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'json' && (
              <div>
                <p className="mb-2 text-xs text-slate-500">
                  Chỉnh sửa trực tiếp JSON cấu hình đầy đủ 11 section.
                </p>
                <textarea
                  rows={18}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
