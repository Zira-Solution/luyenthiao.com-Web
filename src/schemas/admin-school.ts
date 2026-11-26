import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const adminSchoolSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: optStr(),
  active: z.boolean().default(true),
  _count: z
    .object({
      users: z.number().default(0),
    })
    .optional(),
})

export const adminSchoolsSchema = z.array(adminSchoolSchema)

export type AdminSchool = z.output<typeof adminSchoolSchema>

export interface SaveAdminSchoolInput {
  name: string
  city?: string
  active?: boolean
}
