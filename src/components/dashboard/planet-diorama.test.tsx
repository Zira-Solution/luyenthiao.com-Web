import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PlanetDiorama } from '@/components/dashboard/planet-diorama'
import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets, type Planet } from '@/schemas/planet'

function findPlanet(slug: string): Planet {
  const planet = toPlanets(planetsSchema.parse(planets)).find((p) => p.slug === slug)
  if (!planet) throw new Error(`fixture has no ${slug} planet`)
  return planet
}

function renderTitleLetters(slug: string): HTMLElement[] {
  const { container } = render(
    <PlanetDiorama planet={findPlanet(slug)} isActive={false} isVisible={false} />,
  )
  const title = container.querySelector('[aria-hidden="true"].flex')
  if (!title) throw new Error('title container not found')
  return Array.from(title.children) as HTMLElement[]
}

describe('PlanetDiorama title', () => {
  it('rounds translateY to two decimals for a long planet name', () => {
    const letters = renderTitleLetters('toefl_junior')
    expect(letters[1]?.getAttribute('style')).toContain('translateY(11.61px)')

    const values = letters
      .map((el) => el.getAttribute('style') ?? '')
      .flatMap((style) => Array.from(style.matchAll(/translateY\(([^)]*)px\)/g), (m) => m[1] ?? ''))
    expect(values.length).toBeGreaterThan(0)
    for (const value of values) {
      expect(value).toMatch(/^-?\d+(\.\d{1,2})?$/)
    }
  })

  it('renders no transform for a short planet name', () => {
    const letters = renderTitleLetters('ioe')
    expect(letters).toHaveLength(3)
    for (const el of letters) {
      expect(el.getAttribute('style') ?? '').not.toContain('transform:')
    }
  })

  it('renders no styled span for the space between words', () => {
    const letters = renderTitleLetters('toefl_junior')
    const space = letters[5]
    expect(space).toBeDefined()
    expect(space?.textContent).toBe('')
    expect(space?.hasAttribute('style')).toBe(false)
  })
})
