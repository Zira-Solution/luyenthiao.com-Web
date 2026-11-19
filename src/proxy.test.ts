// @vitest-environment node
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy } from './proxy'

function request(
  path: string,
  init?: { method?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'), init)
}

describe('proxy', () => {
  it('redirects a guest from a protected page with 307', () => {
    const res = proxy(request('/admin/exam'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?redirect=%2Fadmin%2Fexam')
  })

  it('reads the lta_authed hint cookie', () => {
    const res = proxy(request('/admin/exam', { headers: { cookie: 'lta_authed=1' } }))
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('ignores a hint with another value', () => {
    const res = proxy(request('/history', { headers: { cookie: 'lta_authed=0' } }))
    expect(res.status).toBe(307)
  })

  it('answers a cross-site POST to /api with 403 JSON', async () => {
    const res = proxy(
      request('/api/admin/media', { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' } }),
    )
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({
      message: 'Yêu cầu không hợp lệ.',
      code: 'CROSS_SITE_REQUEST',
    })
  })
})
