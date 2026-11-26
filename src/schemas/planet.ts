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
  mapTotal: z.number().nullish().optional(),
  mapBackground: z.string().nullish().optional(),
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
  mapTotal?: number
  mapBackground?: string
  /** Where a click goes: `linkUrl`, else the level's exam list. */
  href: string
  /** True while the target route does not exist yet (`/challenges`: sub-project 5). */
  comingSoon: boolean
}

/** Slugs the dashboard never shows (currently all worlds are active). */
const HIDDEN_PLANET_SLUGS: readonly string[] = []

/**
 * Chuẩn hóa hệ thống tên gọi của các Thế Giới Diệu Kỳ (Floating Islands):
 * 1. STARTERS (Pre A1) - Hòn Đảo Kẹo Ngọt
 * 2. MOVERS (A1) - Vương quốc sóng xanh
 * 3. FLYERS (A2) - Khu Vườn Thần Tiên
 * 4. TOEFL PRIMARY (A2, B1) - Miền Đất Tương Lai
 * 5. TOEFL JUNIOR (A2, B2) - Ốc Đảo Thời Gian
 * 6. KET (A2) - Vương Quốc Băng Giá
 * 7. PET (B1) - Xứ Sở San Hô
 * 8. IOE (Cấp 1 - 2) - Đấu Trường Cổ Tích
 * 9. SET PRIMARY (Lớp 3 - 5) - Ốc Đảo Nghìn Lẻ Một Đêm
 * 10. SET JUNIOR (Lớp 6 - 9) - Hòn Đảo Giai Điệu
 */
const PLANET_OVERRIDES: Record<string, Partial<Pick<Planet, 'image' | 'description' | 'name'>>> = {
  starters: {
    name: 'STARTERS',
    image: '/assets/planets/planet_candy_wonderland.png',
    description: 'Hòn Đảo Kẹo Ngọt',
  },
  movers: {
    name: 'MOVERS',
    image: '/clone-assets/media/planet_movers.png',
    description: 'Vương quốc sóng xanh',
  },
  flyers: {
    name: 'FLYERS',
    image: '/clone-assets/media/planet_flyers.png',
    description: 'Khu Vườn Thần Tiên',
  },
  toefl_primary: {
    name: 'TOEFL PRIMARY',
    image: '/clone-assets/media/planet_toefl_primary.png',
    description: 'Miền Đất Tương Lai',
  },
  toefl_junior: {
    name: 'TOEFL JUNIOR',
    image: '/assets/planets/planet_time_oasis.png',
    description: 'Ốc Đảo Thời Gian',
  },
  ket: {
    name: 'KET',
    image: '/assets/planets/planet_frosty_wonderland.png',
    description: 'Vương Quốc Băng Giá',
  },
  pet: {
    name: 'PET',
    image: '/assets/planets/planet_coral_wonderland.png',
    description: 'Xứ Sở San Hô',
  },
  ioe: {
    name: 'IOE',
    image: '/clone-assets/media/planet_ioe.png',
    description: 'Đấu Trường Cổ Tích',
  },
  // Aliases & new fantasy worlds
  arabian: {
    name: 'SET PRIMARY',
    image: '/assets/planets/planet_arabian_nights.png',
    description: 'Ốc Đảo Nghìn Lẻ Một Đêm',
  },
  melody: {
    name: 'SET JUNIOR',
    image: '/assets/planets/planet_melody_island.png',
    description: 'Hòn Đảo Giai Điệu',
  },
  set_primary: {
    name: 'SET PRIMARY',
    image: '/assets/planets/planet_arabian_nights.png',
    description: 'Ốc Đảo Nghìn Lẻ Một Đêm',
  },
  set_junior: {
    name: 'SET JUNIOR',
    image: '/assets/planets/planet_melody_island.png',
    description: 'Hòn Đảo Giai Điệu',
  },
  candy: {
    name: 'STARTERS',
    image: '/assets/planets/planet_candy_wonderland.png',
    description: 'Hòn Đảo Kẹo Ngọt',
  },
  frosty: {
    name: 'KET',
    image: '/assets/planets/planet_frosty_wonderland.png',
    description: 'Vương Quốc Băng Giá',
  },
  coral: {
    name: 'PET',
    image: '/assets/planets/planet_coral_wonderland.png',
    description: 'Xứ Sở San Hô',
  },
  time: {
    name: 'TOEFL JUNIOR',
    image: '/assets/planets/planet_time_oasis.png',
    description: 'Ốc Đảo Thời Gian',
  },
  time_oasis: {
    name: 'TOEFL JUNIOR',
    image: '/assets/planets/planet_time_oasis.png',
    description: 'Ốc Đảo Thời Gian',
  },
}

export const ADVENTURE_WORLDS: readonly Planet[] = [
  {
    slug: 'toefl_junior',
    name: 'TOEFL JUNIOR',
    description: 'Ốc Đảo Thời Gian',
    image: '/assets/planets/planet_time_oasis.png',
    glowColor: '#eab308',
    ribbonFrom: '#f59e0b',
    ribbonTo: '#d97706',
    href: '/challenges/toefl_junior',
    comingSoon: true,
  },
  {
    slug: 'ket',
    name: 'KET',
    description: 'Vương Quốc Băng Giá',
    image: '/assets/planets/planet_frosty_wonderland.png',
    glowColor: '#38bdf8',
    ribbonFrom: '#7dd3fc',
    ribbonTo: '#0284c7',
    href: '/challenges/ket',
    comingSoon: true,
  },
  {
    slug: 'pet',
    name: 'PET',
    description: 'Xứ Sở San Hô',
    image: '/assets/planets/planet_coral_wonderland.png',
    glowColor: '#06b6d4',
    ribbonFrom: '#22d3ee',
    ribbonTo: '#0ea5e9',
    href: '/challenges/pet',
    comingSoon: true,
  },
  {
    slug: 'ioe',
    name: 'IOE',
    description: 'Đấu Trường Cổ Tích',
    image: '/clone-assets/media/planet_ioe.png',
    glowColor: '#3b82f6',
    ribbonFrom: '#3b82f6',
    ribbonTo: '#4f46e5',
    href: '/challenges',
    comingSoon: true,
  },
  {
    slug: 'arabian',
    name: 'SET PRIMARY',
    description: 'Ốc Đảo Nghìn Lẻ Một Đêm',
    image: '/assets/planets/planet_arabian_nights.png',
    glowColor: '#f59e0b',
    ribbonFrom: '#fbbf24',
    ribbonTo: '#d97706',
    href: '/challenges/arabian',
    comingSoon: true,
  },
  {
    slug: 'melody',
    name: 'SET JUNIOR',
    description: 'Hòn Đảo Giai Điệu',
    image: '/assets/planets/planet_melody_island.png',
    glowColor: '#ec4899',
    ribbonFrom: '#f472b6',
    ribbonTo: '#db2777',
    href: '/challenges/melody',
    comingSoon: true,
  },
]

export function formatWorldSubtitle(subtitle: string, slug?: string): string {
  const trimmed = subtitle.trim()
  if (trimmed) {
    // Loại bỏ hoàn toàn các từ "hành tinh", "tinh cầu" nếu còn sót
    return trimmed.replace(/hành tinh\s*/gi, 'Hòn đảo ').replace(/tinh cầu\s*/gi, 'Hòn đảo ')
  }
  if (slug && PLANET_OVERRIDES[slug]?.description) {
    return PLANET_OVERRIDES[slug].description!
  }
  return ''
}

export function toPlanets(rows: z.output<typeof planetsSchema>): Planet[] {
  const mapped = rows
    .filter((row) => !HIDDEN_PLANET_SLUGS.includes(row.slug))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => {
      const override = PLANET_OVERRIDES[row.slug]
      const href =
        row.linkUrl && safeRedirectPath(row.linkUrl) === row.linkUrl
          ? row.linkUrl
          : `/testlevels/${row.slug}`
      const description = formatWorldSubtitle(row.subtitle, row.slug)
      const name = row.name.trim() || override?.name || row.slug
      const image = row.image.trim() || override?.image || '/clone-assets/media/planet_candy.png'
      return {
        slug: row.slug,
        name,
        description,
        image,
        glowColor: row.glowColor,
        ribbonFrom: row.ribbonFrom,
        ribbonTo: row.ribbonTo,
        ...(typeof row.mapTotal === 'number' ? { mapTotal: row.mapTotal } : {}),
        ...(row.mapBackground ? { mapBackground: row.mapBackground } : {}),
        href,
        comingSoon: false,
      }
    })

  const existingSlugs = new Set(mapped.map((p) => p.slug))
  for (const adventureWorld of ADVENTURE_WORLDS) {
    if (!existingSlugs.has(adventureWorld.slug)) {
      mapped.push(adventureWorld)
    }
  }

  return mapped
}
