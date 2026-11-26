import type { ComponentType } from 'react'

import type { DetailGrade } from '@/lib/exam'
import type { AnswerMap, ExamPart } from '@/types/exam'

export interface ReviewContext {
  getGrade(key: string): DetailGrade | undefined
  partScore?: { correct: number; total: number }
}

export interface SpeakingRecordedBlobEntry {
  blob: Blob
  blobUrl: string
  duration: number
}

export interface PartRendererProps {
  part: ExamPart
  structureName: string
  answers: AnswerMap
  onChange: (partId: string, key: string, value: string | null) => void
  review?: ReviewContext
  interactive?: boolean
  speakingBlobs?: Record<string, SpeakingRecordedBlobEntry>
  onSpeakingRecorded?: (
    partId: string,
    questionId: string,
    entry: SpeakingRecordedBlobEntry | null,
  ) => void
}

export type PartRenderer = ComponentType<PartRendererProps>
