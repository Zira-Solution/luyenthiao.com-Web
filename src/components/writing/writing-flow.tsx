'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { WritingIntro } from './writing-intro'
import { WritingSubmitDialog } from './writing-submit-dialog'
import { WritingWorkbench } from './writing-workbench'

import type { WritingTest } from '@/types/writing'

interface WritingFlowProps {
  test: WritingTest
  onSubmitAnswer?: (answer: string) => Promise<void>
}

type Phase = 'intro' | 'working'

/**
 * Điều phối luồng bài thi Viết: giới thiệu → làm bài → xác nhận nộp bài → kết quả.
 */
export function WritingFlow({ test, onSubmitAnswer }: WritingFlowProps): React.ReactElement {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [draft, setDraft] = useState('')

  const attemptId = test.attempt.id

  const startExam = () => {
    setPhase('working')
  }

  const requestSubmit = (answer: string) => {
    setDraft(answer)
    setSubmitOpen(true)
  }

  const confirmSubmit = async () => {
    setSubmitting(true)
    if (onSubmitAnswer) {
      try {
        await onSubmitAnswer(draft)
      } catch {
        setSubmitting(false)
      }
      return
    }
    setTimeout(() => {
      const q = new URLSearchParams({ answer: draft }).toString()
      router.push(`/write/result/${attemptId}?${q}`)
    }, 900)
  }

  const exitToExamList = () => {
    router.push('/testlevels/flyers')
  }

  if (phase === 'working') {
    return (
      <>
        <WritingWorkbench attempt={test.attempt} onSubmit={requestSubmit} onExit={exitToExamList} />
        <WritingSubmitDialog
          open={submitOpen}
          onCancel={() => setSubmitOpen(false)}
          onConfirm={() => void confirmSubmit()}
          submitting={submitting}
        />
      </>
    )
  }

  return <WritingIntro test={test} onStart={startExam} />
}
