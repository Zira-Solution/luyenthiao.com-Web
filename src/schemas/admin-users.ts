import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const adminUserSchoolRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: optStr(),
})

export const adminUserRowSchema = z.object({
  id: z.number(),
  username: z.string(),
  fullName: optStr(),
  email: optStr(),
  role: z.enum(['USER', 'ADMIN']).catch('USER'),
  isBanned: z.boolean().default(false),
  schoolId: z.number().nullable().optional(),
  createdAt: z.string(),
  school: adminUserSchoolRefSchema.nullable().optional(),
  _count: z
    .object({
      examAttempts: z.number().default(0),
      pointLogs: z.number().default(0),
      writingSubmissions: z.number().optional(),
      speakingSubmissions: z.number().optional(),
    })
    .optional(),
})

export const adminUserDetailSchema = adminUserRowSchema.extend({
  totalPoints: z.number().default(0),
  recentAttempts: z
    .array(
      z.object({
        id: z.string(),
        examTitle: optStr(),
        levelSlug: optStr(),
        score: z.number(),
        total: z.number(),
        createdAt: z.string(),
      }),
    )
    .default([]),
  recentPoints: z
    .array(
      z.object({
        id: z.number(),
        points: z.number(),
        source: z.string(),
        refId: optStr(),
        createdAt: z.string(),
      }),
    )
    .default([]),
})

export const pagedAdminUsersSchema = z.object({
  items: z.array(adminUserRowSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type AdminUserRow = z.output<typeof adminUserRowSchema>
export type AdminUserDetail = z.output<typeof adminUserDetailSchema>
export type PagedAdminUsers = z.output<typeof pagedAdminUsersSchema>

export interface UpdateAdminUserInput {
  role?: 'USER' | 'ADMIN'
  isBanned?: boolean
  schoolId?: number | null
  fullName?: string
}
