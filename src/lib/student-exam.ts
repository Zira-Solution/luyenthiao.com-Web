import {
  extractSubmissionPartContext,
  normalizeSpeakingAnswer,
  normalizeWritingFeedback,
  resolveSpeakingAnswerAudio,
} from '@/lib/admin-grading'
import type { AdminSpeakingSubmission, AdminWritingSubmission } from '@/schemas/admin-grading'
import type { AnswerMap, Exam, ExamPart } from '@/types/exam'
import type { SpeakingAnswer, SpeakingAttempt } from '@/types/speaking'
import type { WritingAttempt, WritingTest } from '@/types/writing'

export interface SubjectiveWritePayload {
  partId: string
  answerText: string
  wordCount: number
}

export interface SubjectiveSpeakPayload {
  partId: string
  answers: Record<string, Record<string, unknown>>
}

export interface CheckpointSummaryData {
  level: string
  levelName: string
  challengeNumber: number
  totalMinutes: number
  parts: { name: string; maxScore: number; minutes: number }[]
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Max score sum for write/speak parts matching Backend recomputeTotal() semantics. */
export function computeManualMaxScore(exam: Exam): number {
  let total = 0
  for (const s of exam.structures) {
    for (const p of s.parts) {
      if (p.kind !== 'write' && p.kind !== 'speak') continue
      total += typeof p.maxScore === 'number' && p.maxScore > 0 ? p.maxScore : 5
    }
  }
  return total
}

function objectivePartCount(part: ExamPart): number {
  if (part.kind === 'write' || part.kind === 'speak') {
    return typeof part.maxScore === 'number' && part.maxScore > 0 ? part.maxScore : 5
  }
  let count = 0
  for (const q of part.questions) {
    if (q.isExample) continue
    count += part.kind === 'multichoice' ? 1 : q.details.length
  }
  return count
}

export function toCheckpointSummary(exam: Exam, challengeNumber = 1): CheckpointSummaryData {
  const totalMinutes = exam.structures.reduce((sum, s) => sum + (s.minutes || 0), 0)
  const parts = exam.structures.map((s) => ({
    name: s.name || 'Phần thi',
    minutes: s.minutes || 0,
    maxScore: s.parts.reduce((acc, p) => acc + objectivePartCount(p), 0),
  }))
  return {
    level: exam.levelSlug || 'movers',
    levelName: exam.levelName || exam.levelSlug?.toUpperCase() || 'EXAM',
    challengeNumber,
    totalMinutes,
    parts,
  }
}

export function speakKey(questionId: string, suffix: 'selected' | 'duration' | 'audioUrl'): string {
  return `${questionId}::${suffix}`
}

/**
 * Extracts `writes` and `speaks` payloads matching Backend `ExamAttemptsService.create`
 * (`extractSubjective` in `exam-data.util.ts`).
 */
export function buildSubjectivePayloads(
  exam: Exam,
  answers: AnswerMap,
  uploadedAudioByPartQuestion: Record<string, string> = {},
): {
  writes: SubjectiveWritePayload[]
  speaks: SubjectiveSpeakPayload[]
} {
  const writes: SubjectiveWritePayload[] = []
  const speaks: SubjectiveSpeakPayload[] = []

  for (const s of exam.structures) {
    for (const p of s.parts) {
      const partAnswers = answers[p.id] ?? {}

      if (p.kind === 'write') {
        const answerText = (partAnswers.essay ?? '').trim()
        writes.push({
          partId: p.id,
          answerText,
          wordCount: countWords(answerText),
        })
        continue
      }

      if (p.kind === 'speak') {
        const speakAnswers: Record<string, Record<string, unknown>> = {}
        for (const q of p.speakQuestions ?? []) {
          const selected = partAnswers[speakKey(q.id, 'selected')]
          const rawDuration = partAnswers[speakKey(q.id, 'duration')]
          const duration = rawDuration ? Number.parseInt(rawDuration, 10) : undefined
          const uploadedUrl =
            uploadedAudioByPartQuestion[`${p.id}::${q.id}`] ??
            partAnswers[speakKey(q.id, 'audioUrl')]
          const answered = Boolean(selected || uploadedUrl)

          speakAnswers[q.id] = {
            questionId: q.id,
            answered,
            ...(selected ? { selected } : {}),
            ...(typeof duration === 'number' && Number.isFinite(duration) ? { duration } : {}),
            ...(uploadedUrl ? { recorded: true, audioUrl: uploadedUrl } : {}),
          }
        }
        speaks.push({
          partId: p.id,
          answers: speakAnswers,
        })
      }
    }
  }

  return { writes, speaks }
}

/** Rehydrates AnswerMap from saved backend `ExamAttempt.data` for review mode. */
export function hydrateAnswersFromAttemptData(raw: unknown): AnswerMap {
  if (!raw || typeof raw !== 'object') return {}
  const d = raw as Record<string, unknown>
  const out: AnswerMap = {}

  if (d.answers && typeof d.answers === 'object' && !Array.isArray(d.answers)) {
    for (const [partId, entry] of Object.entries(d.answers as Record<string, unknown>)) {
      if (!entry || typeof entry !== 'object') continue
      const partMap: Record<string, string> = {}
      for (const [k, v] of Object.entries(entry as Record<string, unknown>)) {
        if (typeof v === 'string') partMap[k] = v
      }
      out[partId] = partMap
    }
  }

  if (Array.isArray(d.writes)) {
    for (const w of d.writes) {
      if (!w || typeof w !== 'object') continue
      const item = w as { partId?: unknown; answerText?: unknown }
      if (typeof item.partId === 'string' && typeof item.answerText === 'string') {
        out[item.partId] = { ...(out[item.partId] ?? {}), essay: item.answerText }
      }
    }
  }

  if (Array.isArray(d.speaks)) {
    for (const s of d.speaks) {
      if (!s || typeof s !== 'object') continue
      const item = s as { partId?: unknown; answers?: unknown }
      if (typeof item.partId !== 'string' || !item.answers || typeof item.answers !== 'object') {
        continue
      }
      const next = { ...(out[item.partId] ?? {}) }
      for (const [qId, ans] of Object.entries(item.answers as Record<string, unknown>)) {
        if (!ans || typeof ans !== 'object') continue
        const a = ans as Record<string, unknown>
        if (typeof a.selected === 'string') next[speakKey(qId, 'selected')] = a.selected
        if (typeof a.duration === 'number') next[speakKey(qId, 'duration')] = String(a.duration)
        if (typeof a.audioUrl === 'string') next[speakKey(qId, 'audioUrl')] = a.audioUrl
      }
      out[item.partId] = next
    }
  }

  return out
}

export function toWritingAttemptFromSubmission(sub: AdminWritingSubmission): WritingAttempt {
  const ctx = extractSubmissionPartContext(sub, 'write')
  const fb = normalizeWritingFeedback(sub.feedback)
  const levelSlug = sub.examAttempt?.exam?.levelSlug || 'flyers'
  const examName = sub.examAttempt?.examTitle || sub.examAttempt?.exam?.name || 'Bài thi Viết'

  return {
    id: sub.id,
    headerBadge: levelSlug.toUpperCase(),
    headerTitle: examName,
    badge: sub.status === 'GRADED' ? 'Đã chấm' : 'Chờ chấm',
    maxScore: ctx.maxScore,
    score: sub.score ?? 0,
    prompt: ctx.prompt ?? {
      title: ctx.title || 'Phần Viết',
      instruction: '',
      images: [],
      sampleAnswer: '',
    },
    userAnswer: sub.answerText || '',
    feedback: {
      comment:
        fb.comment ||
        (sub.status === 'PENDING'
          ? 'Bài viết đã được gửi lên hệ thống và đang chờ giáo viên chấm điểm.'
          : 'Giáo viên đã chấm điểm bài viết này.'),
      errors: fb.errors || '—',
      tips: fb.tips || '—',
    },
    minutes: 15,
    submittedAt: sub.submittedAt,
  }
}

export function toWritingTestFromExam(exam: Exam): WritingTest | null {
  for (const s of exam.structures) {
    for (const p of s.parts) {
      if (p.kind !== 'write') continue
      return {
        id: exam.id,
        name: exam.name || 'Bài thi Viết',
        attempt: {
          id: exam.id,
          headerBadge: (exam.levelSlug || 'flyers').toUpperCase(),
          headerTitle: exam.name || 'Bài thi Viết',
          badge: exam.levelName || exam.levelSlug || 'WRITING',
          maxScore: typeof p.maxScore === 'number' && p.maxScore > 0 ? p.maxScore : 5,
          score: 0,
          prompt: p.prompt ?? {
            title: p.title || 'Bài viết',
            instruction: 'Viết bài trả lời theo yêu cầu đề thi.',
            images: [],
            sampleAnswer: '',
          },
          userAnswer: '',
          feedback: { comment: '', errors: '', tips: '' },
          minutes: s.minutes || 15,
          submittedAt: '',
        },
      }
    }
  }
  return null
}

export function toSpeakingTestFromExam(exam: Exam): import('@/types/speaking').SpeakingTest | null {
  for (const s of exam.structures) {
    for (const p of s.parts) {
      if (p.kind !== 'speak') continue
      return {
        id: exam.id,
        name: exam.name || 'Bài thi Nói',
        attempt: {
          id: exam.id,
          userName: 'HỌC VIÊN',
          flyerId: exam.id.slice(0, 8),
          testTitle: exam.name || 'Bài thi Nói',
          testName: exam.name || 'Bài thi Nói',
          diamond: 1,
          time: '10 phút',
          submittedAt: '',
          parts: [
            {
              id: p.id,
              indexLabel: 'Speaking',
              title: p.title || 'Phần thi Nói',
              instruction: 'Nghe câu hỏi và trả lời bằng giọng nói hoặc chọn trên ảnh.',
              questions: p.speakQuestions ?? [],
            },
          ],
        },
      }
    }
  }
  return null
}

export function toSpeakingAttemptFromSubmission(sub: AdminSpeakingSubmission): {
  attempt: SpeakingAttempt
  answers: Record<string, SpeakingAnswer>
  teacherScore?: number | null
  maxScore: number
  status: 'PENDING' | 'GRADED'
  teacherFeedback?: string | null
} {
  const ctx = extractSubmissionPartContext(sub, 'speak')
  const studentName = sub.user?.fullName?.trim() || sub.user?.username || 'Học viên'
  const answersMap: Record<string, SpeakingAnswer> = {}

  for (const [k, raw] of Object.entries(sub.answers)) {
    const entry = normalizeSpeakingAnswer(k, raw)
    const audio = resolveSpeakingAnswerAudio(entry)
    answersMap[k] = {
      questionId: entry.questionId,
      answered: entry.answered,
      detail: entry.detail ?? (entry.selected ? `Đã chọn: ${entry.selected}` : undefined),
      duration: entry.duration,
      blobUrl: audio.kind === 'audio' ? audio.url : entry.blobUrl,
    }
  }

  return {
    attempt: {
      id: sub.id,
      userName: studentName.toUpperCase(),
      flyerId: String(sub.userId),
      testTitle: sub.examAttempt?.examTitle || sub.examAttempt?.exam?.name || 'Bài thi Nói',
      testName: sub.examAttempt?.examTitle || sub.examAttempt?.exam?.name || 'Bài thi Nói',
      diamond: 1,
      time: '10 phút',
      submittedAt: sub.submittedAt,
      parts: [
        {
          id: ctx.id || sub.partId || 'speak-1',
          indexLabel: 'Speaking',
          title: ctx.title || 'Phần thi Nói',
          instruction: 'Nghe và trả lời câu hỏi cùng giáo viên.',
          questions: ctx.speakQuestions ?? [],
        },
      ],
    },
    answers: answersMap,
    teacherScore: sub.manualScore,
    maxScore: ctx.maxScore,
    status: sub.status,
    teacherFeedback: sub.feedback,
  }
}
