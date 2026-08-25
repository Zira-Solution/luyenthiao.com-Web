"use client"

import { useRouter } from "next/navigation"

import { SpeakingResult } from "./speaking-result"

import type { SpeakingTest } from "@/types/speaking"

/**
 * Bọc màn kết quả cho trang độc lập `/speaking/result/[id]` — bổ sung điều hướng.
 */
export function SpeakingResultRoute({
  test,
}: {
  test: SpeakingTest
}): React.ReactElement {
  const router = useRouter()
  const id = test.attempt.id
  return (
    <SpeakingResult
      attempt={test.attempt}
      onBack={() => router.push(`/speaking/${test.id}`)}
      onReview={() => router.push(`/speaking/result/${id}/preview`)}
    />
  )
}