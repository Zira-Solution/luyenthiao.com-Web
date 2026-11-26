import type {
  AdminSpeakingSubmission,
  AdminWritingSubmission,
  WritingFeedbackInput,
} from '@/schemas/admin-grading'
import type { SpeakingQuestion } from '@/types/speaking'
import type { WritingPrompt } from '@/types/writing'

export interface ExtractedSubmissionPart {
  id?: string
  title?: string
  kind?: string
  maxScore: number
  prompt?: WritingPrompt | null
  speakKind?: string | null
  speakQuestions?: SpeakingQuestion[]
  examDeleted: boolean
}

export interface SpeakingAnswerEntry {
  questionId: string
  answered: boolean
  detail?: string
  selected?: string
  duration?: number
  recorded?: boolean
  audioUrl?: string
  blobUrl?: string
}

export type ResolvedSpeakingAudio =
  | { kind: 'audio'; url: string; relativeWarning: boolean }
  | { kind: 'blob-only'; blobUrl: string }
  | { kind: 'none' }

export function extractSubmissionPartContext(
  submission: Pick<AdminWritingSubmission | AdminSpeakingSubmission, 'partId' | 'examAttempt'>,
  expectedKind: 'write' | 'speak',
): ExtractedSubmissionPart {
  const defaultMax = expectedKind === 'write' ? 5 : 10
  const examData = submission.examAttempt?.exam?.data
  if (!examData || typeof examData !== 'object') {
    return {
      maxScore: defaultMax,
      examDeleted: !submission.examAttempt?.exam,
    }
  }

  const structures = (examData as { structures?: unknown }).structures
  if (!Array.isArray(structures)) {
    return { maxScore: defaultMax, examDeleted: false }
  }

  const parts: Record<string, unknown>[] = []
  for (const st of structures) {
    if (!st || typeof st !== 'object') continue
    const list = (st as { parts?: unknown }).parts
    if (!Array.isArray(list)) continue
    for (const p of list) {
      if (p && typeof p === 'object') parts.push(p as Record<string, unknown>)
    }
  }

  const match =
    parts.find((p) => p.id === submission.partId && p.kind === expectedKind) ??
    parts.find((p) => p.kind === expectedKind)

  if (!match) {
    return { maxScore: defaultMax, examDeleted: false }
  }

  const rawMax = match.maxScore
  const maxScore = typeof rawMax === 'number' && rawMax > 0 ? Math.trunc(rawMax) : defaultMax

  return {
    id: typeof match.id === 'string' ? match.id : undefined,
    title: typeof match.title === 'string' ? match.title : undefined,
    kind: typeof match.kind === 'string' ? match.kind : expectedKind,
    maxScore,
    prompt:
      expectedKind === 'write' && match.prompt && typeof match.prompt === 'object'
        ? (match.prompt as WritingPrompt)
        : null,
    speakKind: typeof match.speakKind === 'string' ? match.speakKind : null,
    speakQuestions: Array.isArray(match.speakQuestions)
      ? (match.speakQuestions as SpeakingQuestion[])
      : undefined,
    examDeleted: false,
  }
}

export function normalizeWritingFeedback(raw: unknown): WritingFeedbackInput {
  if (!raw || typeof raw !== 'object') {
    if (typeof raw === 'string' && raw.trim()) {
      return { comment: raw.trim(), errors: '', tips: '' }
    }
    return { comment: '', errors: '', tips: '' }
  }
  const obj = raw as Record<string, unknown>
  return {
    comment: typeof obj.comment === 'string' ? obj.comment : '',
    errors: typeof obj.errors === 'string' ? obj.errors : '',
    tips: typeof obj.tips === 'string' ? obj.tips : '',
  }
}

export function normalizeSpeakingAnswer(key: string, raw: unknown): SpeakingAnswerEntry {
  if (!raw || typeof raw !== 'object') {
    return { questionId: key, answered: false }
  }
  const a = raw as Record<string, unknown>
  return {
    questionId: typeof a.questionId === 'string' && a.questionId ? a.questionId : key,
    answered: Boolean(a.answered),
    detail: typeof a.detail === 'string' ? a.detail : undefined,
    selected: typeof a.selected === 'string' ? a.selected : undefined,
    duration: typeof a.duration === 'number' ? a.duration : undefined,
    recorded: typeof a.recorded === 'boolean' ? a.recorded : undefined,
    audioUrl: typeof a.audioUrl === 'string' ? a.audioUrl : undefined,
    blobUrl: typeof a.blobUrl === 'string' ? a.blobUrl : undefined,
  }
}

export function resolveSpeakingAnswerAudio(
  entry: Pick<SpeakingAnswerEntry, 'audioUrl' | 'blobUrl'>,
  r2PublicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? '',
): ResolvedSpeakingAudio {
  const rawAudio = (entry.audioUrl ?? '').trim()
  if (rawAudio) {
    if (/^https?:\/\//i.test(rawAudio)) {
      return { kind: 'audio', url: rawAudio, relativeWarning: false }
    }
    if (rawAudio.startsWith('/')) {
      const cleanBase = r2PublicBaseUrl.trim().replace(/\/+$/, '')
      if (cleanBase && /^https?:\/\//i.test(cleanBase)) {
        return { kind: 'audio', url: `${cleanBase}${rawAudio}`, relativeWarning: false }
      }
      return { kind: 'audio', url: rawAudio, relativeWarning: true }
    }
  }

  const rawBlob = (entry.blobUrl ?? '').trim()
  if (rawBlob.startsWith('blob:')) {
    return { kind: 'blob-only', blobUrl: rawBlob }
  }

  return { kind: 'none' }
}

export function countSpeakingRecordedAnswers(answers: Record<string, unknown>): {
  totalAnswered: number
  cloudAudioCount: number
} {
  let totalAnswered = 0
  let cloudAudioCount = 0
  for (const [k, raw] of Object.entries(answers)) {
    const entry = normalizeSpeakingAnswer(k, raw)
    if (entry.answered) totalAnswered += 1
    if (entry.audioUrl?.trim()) cloudAudioCount += 1
  }
  return { totalAnswered, cloudAudioCount }
}
