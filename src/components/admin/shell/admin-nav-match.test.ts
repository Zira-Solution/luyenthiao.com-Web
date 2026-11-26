import { describe, expect, it } from 'vitest'

import { isAdminNavActive } from './admin-nav-match'

describe('isAdminNavActive', () => {
  it('matches the exact href', () => {
    expect(isAdminNavActive('/admin/exam', '/admin/exam')).toBe(true)
  })

  it('matches a nested route', () => {
    expect(isAdminNavActive('/admin/exam/abc', '/admin/exam')).toBe(true)
  })

  it('does not match a sibling that only shares a prefix', () => {
    expect(isAdminNavActive('/admin/examination', '/admin/exam')).toBe(false)
  })

  it('does not match a parent route', () => {
    expect(isAdminNavActive('/admin', '/admin/exam')).toBe(false)
  })

  it('matches only the exact pathname when exact is true', () => {
    expect(isAdminNavActive('/admin', '/admin', true)).toBe(true)
    expect(isAdminNavActive('/admin/exam', '/admin', true)).toBe(false)
  })
})
