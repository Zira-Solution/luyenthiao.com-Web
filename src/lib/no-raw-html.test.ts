import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

// Every HTML string must go through <SafeHtml> (spec 2026-11-18-web-security-foundation §6).
const ROOT = path.resolve(import.meta.dirname, '..')
const SKIPPED_DIRS = new Set(['node_modules', '.next', 'public'])
const ALLOWED = new Set([
  path.join('components', 'common', 'safe-html.tsx'),
  path.join('lib', 'no-raw-html.test.ts'),
])
const NEEDLES: RegExp[] = [
  new RegExp(['dangerously', 'SetInnerHTML'].join('')),
  new RegExp(String.raw`\.inner` + 'HTML' + String.raw`\s*=`),
  new RegExp(['insertAdjacent', 'HTML'].join('')),
  new RegExp(['outer', 'HTML'].join('')),
]

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return /\.(m?[jt]sx?)$/.test(entry.name) ? [full] : []
  })
}

const topDirs = readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !SKIPPED_DIRS.has(e.name))
  .map((e) => path.join(ROOT, e.name))

describe('raw HTML sinks', () => {
  it('only components/common/safe-html.tsx writes raw HTML', () => {
    const offenders = topDirs
      .flatMap((d) => sourceFiles(d))
      .map((file) => path.relative(ROOT, file))
      .filter((rel) => !ALLOWED.has(rel))
      .filter((rel) => {
        const text = readFileSync(path.join(ROOT, rel), 'utf8')
        return NEEDLES.some((n) => n.test(text))
      })
    expect(offenders).toEqual([])
  })
})
