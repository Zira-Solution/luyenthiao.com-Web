import { describe, expect, it, vi } from 'vitest'

import { buildContentSecurityPolicy, buildSecurityHeaders } from '@/lib/security-headers'

function headerValue(headers: { key: string; value: string }[], key: string): string | undefined {
  return headers.find((h) => h.key === key)?.value
}

describe('buildSecurityHeaders', () => {
  it('always sends the non-CSP security headers', () => {
    const headers = buildSecurityHeaders({
      apiUrl: 'https://api.luyenthiao.com/api',
      isProduction: false,
    })
    expect(headerValue(headers, 'Strict-Transport-Security')).toBe('max-age=31536000')
    expect(headerValue(headers, 'X-Content-Type-Options')).toBe('nosniff')
    expect(headerValue(headers, 'X-Frame-Options')).toBe('DENY')
    expect(headerValue(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin')
    expect(headerValue(headers, 'Permissions-Policy')).toBe(
      'camera=(), microphone=(self), geolocation=(), payment=()',
    )
  })

  it('omits the CSP outside production (the dev server needs eval and the HMR socket)', () => {
    const headers = buildSecurityHeaders({
      apiUrl: 'http://localhost:3005/api',
      isProduction: false,
    })
    expect(headerValue(headers, 'Content-Security-Policy')).toBeUndefined()
  })

  it('does not throw for an invalid API URL', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      expect(() => buildSecurityHeaders({ apiUrl: 'not a url', isProduction: false })).not.toThrow()
    } finally {
      warn.mockRestore()
    }
  })

  it('adds the CSP in production', () => {
    const headers = buildSecurityHeaders({
      apiUrl: 'https://api.luyenthiao.com/api',
      isProduction: true,
    })
    expect(headerValue(headers, 'Content-Security-Policy')).toBe(
      buildContentSecurityPolicy('https://api.luyenthiao.com/api'),
    )
  })
})

describe('buildContentSecurityPolicy', () => {
  it('lists every directive of the spec, in order', () => {
    expect(buildContentSecurityPolicy('https://api.luyenthiao.com/api')).toBe(
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https: https://api.luyenthiao.com",
        "media-src 'self' blob: https: https://api.luyenthiao.com",
        "font-src 'self' data:",
        "connect-src 'self' https://api.luyenthiao.com wss://api.luyenthiao.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
    )
  })

  it('derives ws: from an http API and keeps the port', () => {
    const csp = buildContentSecurityPolicy('http://localhost:3005/api')
    expect(csp).toContain("connect-src 'self' http://localhost:3005 ws://localhost:3005")
    expect(csp).toContain("img-src 'self' data: blob: https: http://localhost:3005")
  })

  it('does not throw for a non-absolute API URL and allows only self', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const csp = buildContentSecurityPolicy('/api')
      expect(csp.split('; ')).toContain("connect-src 'self'")
      expect(csp).toContain("img-src 'self' data: blob: https:;")
      expect(warn).toHaveBeenCalledTimes(1)
    } finally {
      warn.mockRestore()
    }
  })

  it('treats a scheme-less host:port API URL as invalid instead of emitting null', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const csp = buildContentSecurityPolicy('localhost:3005/api')
      expect(csp.split('; ')).toContain("connect-src 'self'")
      expect(csp).not.toContain('null')
      expect(warn).toHaveBeenCalledTimes(1)
    } finally {
      warn.mockRestore()
    }
  })

  it('drops the path of the API URL', () => {
    expect(buildContentSecurityPolicy('https://example.com:8443/v1/api')).toContain(
      "connect-src 'self' https://example.com:8443 wss://example.com:8443",
    )
  })
})
