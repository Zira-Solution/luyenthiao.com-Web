import { describe, expect, it } from 'vitest'

import { safeRedirectPath } from '@/lib/safe-redirect'

describe('safeRedirectPath', () => {
  it.each([
    ['/admin/exam', '/admin/exam'],
    ['/history?page=2', '/history?page=2'],
    ['/write/writing-demo-1#top', '/write/writing-demo-1#top'],
    // Encoded slashes stay a same-origin path: it renders a 404 here, never another site.
    ['/%2F%2Fevil.com', '/%2F%2Fevil.com'],
  ])('keeps the internal path %s', (raw, expected) => {
    expect(safeRedirectPath(raw)).toBe(expected)
  })

  it.each([
    [null],
    [undefined],
    [''],
    ['//evil.com'],
    ['/\\evil.com'],
    ['https://evil.com'],
    ['javascript:alert(1)'],
    ['evil.com/path'],
    ['/\t/evil.com'],
    ['/\n/evil.com'],
    ['/login'],
    ['/login?redirect=%2Fadmin'],
    ['/signup'],
    // dot segments collapse to a protocol-relative path after URL parsing
    ['/.//evil.com'],
    ['/..//evil.com'],
    ['/%2e//evil.com'],
    ['/%2E%2E//evil.com'],
    ['/a/..//evil.com'],
    // auth pages in other spellings
    ['/LOGIN'],
    ['/%6Cogin'],
    ['/login/'],
    // malformed escape
    ['/%E0%A4%A'],
  ])('falls back to / for %j', (raw) => {
    expect(safeRedirectPath(raw)).toBe('/')
  })
})
