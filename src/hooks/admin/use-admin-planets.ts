'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdminPlanet,
  deleteAdminPlanet,
  listAdminPlanets,
  reorderAdminPlanets,
  updateAdminPlanet,
} from '@/lib/api/admin/planets'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { SaveAdminPlanetInput } from '@/schemas/admin-planet'

export function useAdminPlanets() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.adminPlanets(),
    queryFn: listAdminPlanets,
    enabled,
    staleTime: 5 * 60_000,
    retry: retryTransient,
  })
}

export function useCreateAdminPlanet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveAdminPlanetInput) => createAdminPlanet(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlanets() })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}

export function useUpdateAdminPlanet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SaveAdminPlanetInput }) =>
      updateAdminPlanet(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlanets() })
    },
  })
}

export function useReorderAdminPlanets() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => reorderAdminPlanets(ids),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlanets() })
    },
  })
}

export function useDeleteAdminPlanet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAdminPlanet(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.adminPlanets() })
      void qc.invalidateQueries({ queryKey: queryKeys.adminStats() })
    },
  })
}
