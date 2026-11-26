import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// Stronger marker set after the Task 3 review. A bare `text-white` cannot be judged statically
// (it is legitimate on solid coloured buttons); it is covered by the per-component rendered tests.
const DARK_MARKERS =
  /bg-white\/\d|text-white\/\d|border-white\/|backdrop-blur|bg-dashboard-bg|bg-topbar-login-bg|text-game-|bg-game-|bg-slate-900|placeholder:text-slate-400|placeholder:text-white\//

const ADMIN_DIR = dirname(fileURLToPath(import.meta.url))

function isTestFile(name: string): boolean {
  return /\.test\.tsx?$/.test(name)
}

function listTsxFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...listTsxFiles(full))
    } else if (entry.name.endsWith('.tsx') && !isTestFile(entry.name)) {
      files.push(full)
    }
  }
  return files
}

describe('admin light theme guard', () => {
  it('finds the admin component files it is supposed to scan', () => {
    const files = listTsxFiles(ADMIN_DIR)
    expect(files.length).toBeGreaterThan(10)
    expect(files.some((f) => f.endsWith('media-browser-dialog.tsx'))).toBe(true)
  })

  it('leaves no dark-theme classes in any admin .tsx file', () => {
    const offenders = listTsxFiles(ADMIN_DIR)
      .filter((file) => DARK_MARKERS.test(readFileSync(file, 'utf8')))
      .map((file) => relative(ADMIN_DIR, file).replaceAll('\\', '/'))
      .sort()

    expect(offenders, `files with dark-theme classes: ${offenders.join(', ')}`).toEqual([])
  })
})
