import { describe, expect, it } from 'vitest'

import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets } from '@/schemas/planet'

describe('planets', () => {
  it('parses the real payload and maps it in sortOrder', () => {
    const result = toPlanets(planetsSchema.parse(planets))
    expect(result.map((p) => p.slug)).toEqual([
      'starters',
      'movers',
      'flyers',
      'toefl_primary',
      'toefl_junior',
      'ket',
      'pet',
      'ioe',
      'arabian',
      'melody',
    ])
    expect(result[0]).toEqual({
      slug: 'starters',
      name: 'STARTERS',
      description: 'Hòn Đảo Kẹo Ngọt',
      image: '/assets/planets/planet_candy_wonderland.png',
      mapBackground: '/clone-assets/exam/bg-map.73c46437.jpg',
      mapTotal: 200,
      glowColor: '#ec4899',
      ribbonFrom: '#f472b6',
      ribbonTo: '#fb7185',
      href: '/testlevels/starters',
      comingSoon: false,
    })
  })

  it('uses a safe linkUrl as href and unlocks /challenges', () => {
    const rows = planetsSchema.parse(planets)
    const starters = rows.find((row) => row.slug === 'starters')
    if (!starters) throw new Error('fixture has no starters row')
    const [planet] = toPlanets([{ ...starters, linkUrl: '/challenges' }])
    expect(planet?.href).toBe('/challenges')
    expect(planet?.comingSoon).toBe(false)
  })

  it('includes the ioe planet with arena diorama', () => {
    const result = toPlanets(planetsSchema.parse(planets))
    const ioe = result.find((p) => p.slug === 'ioe')
    expect(ioe).toBeDefined()
    expect(ioe?.name).toBe('IOE')
    expect(ioe?.description).toBe('Đấu Trường Cổ Tích')
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
    for (const planet of toPlanets(rows).filter(
      (p) =>
        ![
          'toefl_junior',
          'ket',
          'pet',
          'ioe',
          'arabian',
          'melody',
          'candy',
          'coral',
          'time',
          'frosty',
        ].includes(p.slug),
    )) {
      expect(planet.href).toBe(`/testlevels/${planet.slug}`)
      expect(planet.comingSoon).toBe(false)
    }
  })

  it('ưu tiên tên, ảnh và mô tả từ Admin API thay vì PLANET_OVERRIDES cứng', () => {
    const rows = planetsSchema.parse(planets)
    const starters = rows.find((row) => row.slug === 'starters')!
    const [custom] = toPlanets([
      {
        ...starters,
        name: 'STARTERS CUSTOM',
        subtitle: 'Thế giới mới từ Admin',
        image: 'https://cdn.example.com/custom-planet.png',
      },
    ])
    expect(custom?.name).toBe('STARTERS CUSTOM')
    expect(custom?.description).toBe('Thế giới mới từ Admin')
    expect(custom?.image).toBe('https://cdn.example.com/custom-planet.png')
  })
})
