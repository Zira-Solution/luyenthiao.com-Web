import { safeRedirectPath } from '@/lib/safe-redirect'
import { z } from '@/lib/zod'

const planetSchema = z.object({
  slug: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string(),
  linkUrl: z.string(),
  glowColor: z.string(),
  ribbonFrom: z.string(),
  ribbonTo: z.string(),
  sortOrder: z.number(),
})

export const planetsSchema = z.array(planetSchema)

export interface Planet {
  slug: string
  name: string
  description: string
  image: string
  glowColor: string
  ribbonFrom: string
  ribbonTo: string
  /** Where a click goes: `linkUrl`, else the level's exam list. */
  href: string
  /** True while the target route does not exist yet (`/challenges`: sub-project 5). */
  comingSoon: boolean
}

/** Slugs the dashboard never shows. */
const HIDDEN_PLANET_SLUGS: readonly string[] = ['ioe']

/** Per-slug image/description that win over the API row values. */
const PLANET_OVERRIDES: Record<string, Partial<Pick<Planet, 'image' | 'description'>>> = {
  starters: {
    image: '/clone-assets/media/planet_ioe.png',
    description: 'Đấu Trường Tri Thức',
  },
}

export function toPlanets(rows: z.output<typeof planetsSchema>): Planet[] {
  return rows
    .filter((row) => !HIDDEN_PLANET_SLUGS.includes(row.slug))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => {
      const href =
        row.linkUrl && safeRedirectPath(row.linkUrl) === row.linkUrl
          ? row.linkUrl
          : `/testlevels/${row.slug}`
      return {
        slug: row.slug,
        name: row.name,
        description: row.subtitle,
        image: row.image,
        ...PLANET_OVERRIDES[row.slug],
        glowColor: row.glowColor,
        ribbonFrom: row.ribbonFrom,
        ribbonTo: row.ribbonTo,
        href,
        comingSoon: href.startsWith('/challenges'),
      }
    })
}
