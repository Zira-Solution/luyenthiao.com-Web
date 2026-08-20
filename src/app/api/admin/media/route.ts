import { promises as fs } from "node:fs"
import path from "node:path"

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"])
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "m4a"])
const SKIP_DIRS = new Set(["_next", "cm"])
const ROOT = path.join(process.cwd(), "public", "clone-assets")

interface Entry {
  name: string
  path: string
  dir: string
  ext: string
}

let cache: { at: number; entries: Entry[] } | null = null
const TTL_MS = 60_000

async function walk(dir: string, rel: string, out: Entry[]): Promise<void> {
  const items = await fs.readdir(dir, { withFileTypes: true })
  for (const item of items) {
    if (SKIP_DIRS.has(item.name)) continue
    const abs = path.join(dir, item.name)
    const relPath = rel ? `${rel}/${item.name}` : item.name
    if (item.isDirectory()) {
      await walk(abs, relPath, out)
    } else if (item.isFile()) {
      const ext = path.extname(item.name).slice(1).toLowerCase()
      if (IMAGE_EXTS.has(ext) || AUDIO_EXTS.has(ext)) {
        out.push({
          name: item.name,
          path: `/clone-assets/${relPath}`,
          dir: rel || ".",
          ext,
        })
      }
    }
  }
}

async function listAll(): Promise<Entry[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.entries
  const entries: Entry[] = []
  await walk(ROOT, "", entries)
  entries.sort((a, b) => a.path.localeCompare(b.path))
  cache = { at: Date.now(), entries }
  return entries
}

export async function GET(request: Request): Promise<NextResponse> {
  const type = new URL(request.url).searchParams.get("type") ?? "image"
  const allowed = type === "audio" ? AUDIO_EXTS : IMAGE_EXTS
  const entries = await listAll()
  const items = entries.filter((e) => allowed.has(e.ext as never))
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  )
}