import { describe, expect, it } from 'vitest'

import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets } from '@/schemas/planet'

describe('planets', () => {
  it('parses the real payload and maps it in sortOrder', () => {
    const result = toPlanets(planetsSchema.parse(planets))
    expect(result.map((p) => p.slug)).toEqual(['starters', 'movers', 'flyers', 'toefl_primary'])
    expect(result[0]).toEqual({
      slug: 'starters',
      name: planets[1]?.name,
      description: 'Đấu Trường Tri Thức',
      image: '/clone-assets/media/planet_ioe.png',
      glowColor: planets[1]?.glowColor,
      ribbonFrom: planets[1]?.ribbonFrom,
      ribbonTo: planets[1]?.ribbonTo,
      href: '/testlevels/starters',
      comingSoon: false,
    })
  })

  it('uses a safe linkUrl as href and marks /challenges as coming soon', () => {
    const rows = planetsSchema.parse(planets)
    const starters = rows.find((row) => row.slug === 'starters')
    if (!starters) throw new Error('fixture has no starters row')
    const [planet] = toPlanets([{ ...starters, linkUrl: '/challenges' }])
    expect(planet?.href).toBe('/challenges')
    expect(planet?.comingSoon).toBe(true)
  })

  it('drops the ioe planet', () => {
    const result = toPlanets(planetsSchema.parse(planets))
    expect(result.some((p) => p.slug === 'ioe')).toBe(false)
  })

  it.each([
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '/\t/evil.example',
    '/\n/evil.example',
    '/\r/evil.example',
  ])('ignores the unsafe linkUrl %s', (linkUrl) => {
    const rows = planetsSchema.parse(planets).map((row) => ({ ...row, linkUrl }))
    for (const planet of toPlanets(rows)) {
      expect(planet.href).toBe(`/testlevels/${planet.slug}`)
      expect(planet.comingSoon).toBe(false)
    }
  })
})
