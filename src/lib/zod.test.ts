import { describe, expect, it } from 'vitest'

import { z } from '@/lib/zod'

describe('@/lib/zod', () => {
  it('runs in jitless mode so no eval-like code is generated', () => {
    expect(z.config().jitless).toBe(true)
  })

  it('still parses an object schema', () => {
    expect(z.object({ a: z.string() }).parse({ a: 'x' })).toEqual({ a: 'x' })
  })
})
