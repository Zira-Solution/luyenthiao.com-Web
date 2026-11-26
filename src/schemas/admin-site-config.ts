import { z } from '@/lib/zod'
import { optStr } from '@/schemas/admin-common'

export const siteLanguageSchema = z.object({
  code: z.enum(['vi', 'en']),
  label: z.string(),
  flagSvgId: z.enum(['vn', 'us']),
  flagImage: optStr(),
})

export const siteMapTextEntrySchema = z.object({
  vi: z.string(),
  en: z.string(),
})

export const siteConfigSchema = z.object({
  mapAssets: z.record(z.string(), z.string()).default({}),
  mapTexts: z.record(z.string(), siteMapTextEntrySchema).default({}),
  languages: z.array(siteLanguageSchema).default([]),
  defaultLanguage: z.enum(['vi', 'en']).default('vi'),
  globalAssets: z.record(z.string(), z.string()).default({}),
  authAssets: z.record(z.string(), z.string()).default({}),
  homeAssets: z
    .object({
      background: z.string().default(''),
      topbarIcons: z.record(z.string(), z.string()).default({}),
      bottomNavIcons: z.record(z.string(), z.string()).default({}),
    })
    .default({ background: '', topbarIcons: {}, bottomNavIcons: {} }),
  speakingAssets: z.record(z.string(), z.string()).default({}),
  writingAssets: z.record(z.string(), z.string()).default({}),
  challengeAssets: z.record(z.string(), z.string()).default({}),
  checkpointAssets: z.record(z.string(), z.string()).default({}),
})

export type AdminSiteConfig = z.output<typeof siteConfigSchema>
