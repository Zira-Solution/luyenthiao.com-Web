import { describe, expect, it } from 'vitest'

import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets } from '@/schemas/planet'

describe('planets', () => {
  it('parses the real payload and maps it in sortOrder', () => {
    const result = toPlanets(planetsSchema.parse(planets))
    expect(result.map((p) => p.slug)).toEqual([
      'ioe',
      'starters',
      'movers',
      'flyers',
      'toefl_primary',
    ])
    expect(result[1]).toEqual({
      slug: 'starters',
      name: planets[1]?.name,
      description: planets[1]?.subtitle,
      image: planets[1]?.image,
      glowColor: planets[1]?.glowColor,
      ribbonFrom: planets[1]?.ribbonFrom,
      ribbonTo: planets[1]?.ribbonTo,
      href: '/testlevels/starters',
      comingSoon: false,
    })
  })

  it('uses linkUrl when set and marks /challenges as coming soon', () => {
    const [ioe] = toPlanets(planetsSchema.parse(planets))
    expect(ioe?.href).toBe('/challenges')
    expect(ioe?.comingSoon).toBe(true)
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
