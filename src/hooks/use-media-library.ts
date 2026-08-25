"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchMediaLibrary, type MediaKind } from "@/lib/admin/media"

export function useMediaLibrary(kind: MediaKind) {
  return useQuery({
    queryKey: ["admin-media", kind],
    queryFn: () => fetchMediaLibrary(kind),
    staleTime: 5 * 60_000,
  })
}