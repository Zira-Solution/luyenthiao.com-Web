import { describe, expect, it } from 'vitest'

import { LEVEL_OPTIONS, levelLabel } from '@/lib/level-label'

describe('levelLabel', () => {
  it('maps the seeded slugs', () => {
    expect(levelLabel('starters')).toBe('Starters (Pre A1)')
    expect(levelLabel('movers')).toBe('Movers (A1)')
    expect(levelLabel('flyers')).toBe('Flyers (A2)')
    expect(levelLabel('ioe')).toBe('IOE')
    expect(levelLabel('toefl_primary')).toBe('TOEFL Primary')
  })

  it('shows an unknown slug as is and an empty one as a dash', () => {
    expect(levelLabel('ket')).toBe('ket')
    expect(levelLabel('')).toBe('—')
    expect(levelLabel('constructor')).toBe('constructor')
  })

  it('offers every known level as a filter option', () => {
    expect(LEVEL_OPTIONS.map((o) => o.value)).toEqual([
      'ioe',
      'starters',
      'movers',
      'flyers',
      'toefl_primary',
    ])
  })
})
