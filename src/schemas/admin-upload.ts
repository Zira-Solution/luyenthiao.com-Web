import { z } from '@/lib/zod'

export const r2UploadItemSchema = z.object({
  key: z.string(),
  url: z.string(),
  name: z.string(),
  kind: z.enum(['image', 'audio']),
  size: z.number(),
  lastModified: z.string().nullable(),
})

export const r2ListResponseSchema = z.object({
  configured: z.boolean(),
  items: z.array(r2UploadItemSchema),
  nextCursor: z.string().nullable(),
})

export const r2UploadResultSchema = z.object({
  url: z.string(),
})

export type R2UploadItem = z.output<typeof r2UploadItemSchema>
export type R2ListResponse = z.output<typeof r2ListResponseSchema>
