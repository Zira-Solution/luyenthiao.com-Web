"use client"

import { useMemo, useState } from "react"

import { SpeakingIntro } from "./speaking-intro"
import { SpeakingMicCheck } from "./speaking-mic-check"
import { SpeakingPreview } from "./speaking-preview"
import { SpeakingResult } from "./speaking-result"
import { SpeakingSubmitDialog } from "./speaking-submit-dialog"
import { SpeakingWorkbench } from "./speaking-workbench"

import type { SpeakingAnswer, SpeakingTest } from "@/types/speaking"

interface SpeakingFlowProps {
  test: SpeakingTest
}

type Phase = "intro" | "miccheck" | "take" | "result" | "preview"

/**
 * Điều phối luồng bài thi Nói: hướng dẫn → kiểm tra mic → làm bài → kết quả.
 */
export function SpeakingFlow({ test }: SpeakingFlowProps): React.ReactElement {
  const [phase, setPhase] = useState<Phase>("intro")
  const [answers, setAnswers] = useState<Record<string, SpeakingAnswer>>({})
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const total = useMemo(
    () => test.attempt.parts.reduce((n, p) => n + p.questions.length, 0),
    [test],
  )
  const unanswered =
    total -
    Object.keys(answers).filter((id) => answers[id]?.answered).length

  const handleAnswered = (
    id: string,
    partial: Omit<SpeakingAnswer, "questionId">,
  ) => {
    setAnswers((prev) => ({ ...prev, [id]: { questionId: id, ...partial } }))
  }

  const confirmSubmit = () => {
    setSubmitting(true)
    // Mô phỏng chờ hệ thống nhận bài.
    setTimeout(() => {
      setSubmitting(false)
      setSubmitOpen(false)
      setPhase("result")
    }, 800)
  }

  if (phase === "take") {
    return (
      <>
        <SpeakingWorkbench
          attempt={test.attempt}
          answers={answers}
          onAnswered={handleAnswered}
          onOpenSubmit={() => setSubmitOpen(true)}
        />
        <SpeakingSubmitDialog
          open={submitOpen}
          unanswered={unanswered}
          submitting={submitting}
          onCancel={() => setSubmitOpen(false)}
          onConfirm={confirmSubmit}
        />
      </>
    )
  }

  if (phase === "result") {
    return (
      <SpeakingResult
        attempt={test.attempt}
        onBack={() => setPhase("intro")}
        onReview={() => setPhase("preview")}
      />
    )
  }

  if (phase === "preview") {
    return (
      <SpeakingPreview
        attempt={test.attempt}
        answers={answers}
        onBack={() => setPhase("result")}
      />
    )
  }

  if (phase === "miccheck") {
    return (
      <SpeakingMicCheck
        onSkip={() => setPhase("take")}
        onDone={() => setPhase("take")}
      />
    )
  }

  return <SpeakingIntro name={test.name} onStart={() => setPhase("miccheck")} />
}