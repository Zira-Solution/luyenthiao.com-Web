'use client'

import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactElement } from 'react'

import { PlanetFormDialog } from './planet-form-dialog'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import {
  useAdminPlanets,
  useCreateAdminPlanet,
  useDeleteAdminPlanet,
  useReorderAdminPlanets,
  useUpdateAdminPlanet,
} from '@/hooks/admin'
import type { AdminPlanet, SaveAdminPlanetInput } from '@/schemas/admin-planet'

export function PlanetsAdminView(): ReactElement {
  const { data: planets = [], isLoading, error } = useAdminPlanets()
  const createPlanet = useCreateAdminPlanet()
  const updatePlanet = useUpdateAdminPlanet()
  const reorderPlanets = useReorderAdminPlanets()
  const deletePlanet = useDeleteAdminPlanet()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPlanet | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleMove = async (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta
    if (targetIdx < 0 || targetIdx >= planets.length) return
    setActionError(null)
    const ids = planets.map((p) => p.id)
    const [moved] = ids.splice(index, 1)
    if (!moved) return
    ids.splice(targetIdx, 0, moved)
    try {
      await reorderPlanets.mutateAsync(ids)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không cập nhật được thứ tự.')
    }
  }

  const handleSave = async (input: SaveAdminPlanetInput, editingId?: string) => {
    if (editingId) {
      await updatePlanet.mutateAsync({ id: editingId, input })
    } else {
      await createPlanet.mutateAsync(input)
    }
    setDialogOpen(false)
    setEditing(null)
  }

  const handleDelete = async (planet: AdminPlanet) => {
    if (!window.confirm(`Xóa hành tinh "${planet.name}" (${planet.slug})?`)) return
    setActionError(null)
    try {
      await deletePlanet.mutateAsync(planet.id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Không xóa được hành tinh.')
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Quản trị Hành tinh (Thế giới)"
        description="Quản lý danh sách hòn đảo/hành tinh học tập, thứ tự hiển thị và ảnh R2 đồng bộ trực tiếp ra trang chủ."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Hành tinh' }]}
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
            Thêm hành tinh
          </button>
        }
      />

      {(error || actionError) && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
        >
          {actionError ?? (error instanceof Error ? error.message : 'Không tải được hành tinh.')}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Đang tải danh sách hành tinh...
          </div>
        ) : planets.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Chưa có hành tinh nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <th className="px-4 py-3">Thứ tự</th>
                  <th className="px-4 py-3">Ảnh</th>
                  <th className="px-4 py-3">Hành tinh / Slug</th>
                  <th className="px-4 py-3">Trình độ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planets.map((planet, idx) => (
                  <tr key={planet.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="w-6 text-xs font-semibold text-slate-500">#{idx + 1}</span>
                        <button
                          type="button"
                          disabled={idx === 0 || reorderPlanets.isPending}
                          onClick={() => void handleMove(idx, -1)}
                          aria-label={`Đưa ${planet.name} lên`}
                          className="cursor-pointer rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === planets.length - 1 || reorderPlanets.isPending}
                          onClick={() => void handleMove(idx, 1)}
                          aria-label={`Đưa ${planet.name} xuống`}
                          className="cursor-pointer rounded border border-slate-200 p-1 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {planet.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={planet.image}
                          alt={planet.name}
                          className="size-11 rounded-lg border border-slate-200 bg-slate-50 object-contain p-0.5"
                        />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                          Trống
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{planet.name}</p>
                      <p className="text-xs text-slate-500">
                        {planet.slug} {planet.subtitle ? `· ${planet.subtitle}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">
                      {planet.level || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {planet.visible ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <Eye className="size-3.5" aria-hidden="true" />
                          Đang hiện
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          <EyeOff className="size-3.5" aria-hidden="true" />
                          Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(planet)
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
                          onClick={() => void handleDelete(planet)}
                          aria-label={`Xóa ${planet.name}`}
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

      <PlanetFormDialog
        open={dialogOpen}
        editing={editing}
        submitting={createPlanet.isPending || updatePlanet.isPending}
        onClose={() => {
          setDialogOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
      />
    </>
  )
}
