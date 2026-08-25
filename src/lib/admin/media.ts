export interface MediaItem {
  name: string
  path: string
  dir: string
  ext: string
}

export type MediaKind = "image" | "audio"

export async function fetchMediaLibrary(kind: MediaKind): Promise<MediaItem[]> {
  const res = await fetch(`/api/admin/media?type=${kind}`)
  if (!res.ok) throw new Error("Không tải được thư viện media")
  const data = (await res.json()) as { items: MediaItem[] }
  return data.items
}