import { parseOrThrow } from '@/lib/api/parse'
import { authFetch } from '@/lib/api-client'
import {
  adminSchoolSchema,
  adminSchoolsSchema,
  type AdminSchool,
  type SaveAdminSchoolInput,
} from '@/schemas/admin-school'

export async function listAdminSchools(): Promise<AdminSchool[]> {
  const res = await authFetch<unknown>('/schools')
  return parseOrThrow(adminSchoolsSchema, res, '/schools')
}

export async function createAdminSchool(input: SaveAdminSchoolInput): Promise<AdminSchool> {
  const res = await authFetch<unknown>('/schools', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminSchoolSchema, res, '/schools')
}

export async function updateAdminSchool(
  id: number,
  input: Partial<SaveAdminSchoolInput>,
): Promise<AdminSchool> {
  const res = await authFetch<unknown>(`/schools/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return parseOrThrow(adminSchoolSchema, res, '/schools/:id')
}

export async function deleteAdminSchool(id: number): Promise<unknown> {
  return authFetch<unknown>(`/schools/${id}`, { method: 'DELETE' })
}
