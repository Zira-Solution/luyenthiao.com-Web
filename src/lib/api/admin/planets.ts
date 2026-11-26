import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import { adminDeleteMessageSchema } from '@/schemas/admin-exam'
import {
  adminPlanetSchema,
  adminPlanetsSchema,
  type AdminPlanet,
  type SaveAdminPlanetInput,
} from '@/schemas/admin-planet'

export async function listAdminPlanets(): Promise<AdminPlanet[]> {
  const res = await authFetch<unknown>('/planets')
  return parseOrThrow(adminPlanetsSchema, res, '/planets')
}

export async function createAdminPlanet(input: SaveAdminPlanetInput): Promise<AdminPlanet> {
  const res = await authFetch<unknown>('/planets', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminPlanetSchema, res, '/planets')
}

export async function updateAdminPlanet(
  id: string,
  input: SaveAdminPlanetInput,
): Promise<AdminPlanet> {
  const res = await authFetch<unknown>(`/planets/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminPlanetSchema, res, '/planets/:id')
}

export async function reorderAdminPlanets(ids: string[]): Promise<{ message: string }> {
  const res = await authFetch<unknown>('/planets/reorder', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
  return parseOrThrow(adminDeleteMessageSchema, res, '/planets/reorder')
}

export async function deleteAdminPlanet(id: string): Promise<{ message: string }> {
  const res = await authFetch<unknown>(`/planets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  return parseOrThrow(adminDeleteMessageSchema, res, '/planets/:id')
}
