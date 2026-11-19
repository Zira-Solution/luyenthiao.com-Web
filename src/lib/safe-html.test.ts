import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from '@/lib/safe-html'

describe('sanitizeHtml — exam markup survives', () => {
  it.each([
    ['<p><strong>A</strong><br></p>', '<p><strong>A</strong><br /></p>'],
    [
      '<span style="background-color:transparent;color:#000000;">x</span>',
      '<span style="background-color:transparent;color:#000000">x</span>',
    ],
    [
      '<img src="/image/abc" style="width: 463px; height: 305px;" width="463" height="305">',
      '<img src="/image/abc" style="width:463px;height:305px" width="463" height="305" />',
    ],
    [
      '<table style="width: 100.741%; margin-left: -0.740741%;"><tbody><tr><td>1</td></tr></tbody></table>',
      '<table style="width:100.741%;margin-left:-0.740741%"><tbody><tr><td>1</td></tr></tbody></table>',
    ],
    ['<img src="data:image/png;base64,AA">', '<img src="data:image/png;base64,AA" />'],
    [
      '<ul><li><em>i</em> <u>u</u> <sub>2</sub></li></ul>',
      '<ul><li><em>i</em> <u>u</u> <sub>2</sub></li></ul>',
    ],
    [
      '<a href="https://luyenthiao.com/x">link</a>',
      '<a href="https://luyenthiao.com/x" target="_blank" rel="noopener noreferrer">link</a>',
    ],
    ['<img src="DATA:image/png;base64,AA">', '<img src="DATA:image/png;base64,AA" />'],
    ['<p>unclosed <strong>b', '<p>unclosed <strong>b</strong></p>'],
  ])('%s', (input, expected) => {
    expect(sanitizeHtml(input)).toBe(expected)
  })
})

describe('sanitizeHtml — XSS payloads are neutralised', () => {
  it.each([
    ['<img src=x onerror=alert(1)>', '<img src="x" />'],
    ['<a href="javascript:alert(1)">x</a>', '<a target="_blank" rel="noopener noreferrer">x</a>'],
    ['<a href="//evil.com">x</a>', '<a target="_blank" rel="noopener noreferrer">x</a>'],
    ['<a href="data:text/html,x">d</a>', '<a target="_blank" rel="noopener noreferrer">d</a>'],
    ['<svg onload=alert(1)>', ''],
    ['<iframe src="https://e.com"></iframe>', ''],
    ['<script>alert(1)</script>t', 't'],
    ['<span style="background:url(javascript:alert(1))">s</span>', '<span>s</span>'],
    ['<p class="fixed inset-0 z-50">overlay</p>', '<p>overlay</p>'],
    ['<p id="__next">clobber</p>', '<p>clobber</p>'],
    ['<img src="data:image/svg+xml,<svg onload=alert(1)>">', '<img />'],
    ['<img src="data:text/html;base64,PHNjcmlwdD4=">', '<img />'],
    ['<form action="https://e.com"><input name="p"></form>', ''],
  ])('%s', (input, expected) => {
    expect(sanitizeHtml(input)).toBe(expected)
  })
})
