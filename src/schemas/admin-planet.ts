import { z } from '@/lib/zod'
import { optNum, optStr } from '@/schemas/admin-common'

export const adminPlanetSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  nameEn: optStr(),
  subtitle: optStr(),
  subtitleEn: optStr(),
  level: optStr(),
  image: optStr(),
  mapBackground: optStr(),
  linkUrl: optStr(),
  mapTotal: optNum(200),
  glowColor: optStr('#7c3aed'),
  ribbonFrom: optStr('#f472b6'),
  ribbonTo: optStr('#f43f5e'),
  sortOrder: z.number().default(0),
  visible: z.boolean().default(true),
})

export const adminPlanetsSchema = z.array(adminPlanetSchema)

export type AdminPlanet = z.output<typeof adminPlanetSchema>

export interface SaveAdminPlanetInput {
  slug: string
  name: string
  nameEn: string
  subtitle?: string
  subtitleEn?: string
  level?: string
  image?: string
  mapBackground?: string
  linkUrl?: string
  mapTotal?: number
  glowColor?: string
  ribbonFrom?: string
  ribbonTo?: string
  visible?: boolean
}
