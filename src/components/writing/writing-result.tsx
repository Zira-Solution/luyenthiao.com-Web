"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { WritingResultOverview } from "./writing-result-overview"
import { WritingReview } from "./writing-review"

import type { WritingAttempt } from "@/types/writing"

interface WritingResultContentProps {
  attempt: WritingAttempt
  writeSlug: string
}

type View = "overview" | "review"

/**
 * Trang kết quả bài Viết: overview điểm số, bấm "Xem lại" để xem nhận xét chi tiết.
 */
export function WritingResultContent({
  attempt,
  writeSlug,
}: WritingResultContentProps): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [view, setView] = useState<View>("overview")

  // Cập nhật câu trả lời cuối cùng của thí sinh từ query (không có backend).
  const userAnswer = searchParams.get("answer") ?? attempt.userAnswer
  const hydrated: WritingAttempt = userAnswer
    ? { ...attempt, userAnswer }
    : attempt

  const retake = () => router.push(`/write/${writeSlug}`)
  const next = () => router.push("/testlevels/flyers")

  if (view === "review") {
    return (
      <WritingReview
        attempt={hydrated}
        onBack={() => setView("overview")}
        onRetake={retake}
        onExitReview={next}
      />
    )
  }

  return (
    <WritingResultOverview
      attempt={hydrated}
      onRetake={retake}
      onReview={() => setView("review")}
      onNext={next}
    />
  )
}