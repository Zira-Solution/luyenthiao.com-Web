import type { Exam, ExamPart, ExamStructure, PartKind } from '@/types/exam'
import type { SpeakingQuestion } from '@/types/speaking'
import type { WritingPrompt } from '@/types/writing'

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

export function blankQuestion() {
  return {
    id: createId('q'),
    isExample: false,
    title: '',
    details: [],
  }
}

export function defaultWritingPrompt(): WritingPrompt {
  return {
    title: 'Phần 1',
    instruction: '',
    images: [
      { slot: 'story-img-1', src: null, alt: 'Ảnh 1' },
      { slot: 'story-img-2', src: null, alt: 'Ảnh 2' },
      { slot: 'story-img-3', src: null, alt: 'Ảnh 3' },
    ],
    sampleAnswer: '',
  }
}

export function blankSpeakQuestion(kind: SpeakingQuestion['kind'] = 'mic-plain'): SpeakingQuestion {
  return {
    id: createId('sq'),
    kind,
    text: '',
    vi: '',
  }
}

export function blankPart(kind: PartKind = 'gapfill'): ExamPart {
  if (kind === 'write') {
    return {
      id: createId('p'),
      kind,
      title: '',
      maxScore: 5,
      prompt: defaultWritingPrompt(),
      questions: [],
    }
  }
  if (kind === 'speak') {
    return {
      id: createId('p'),
      kind,
      title: '',
      maxScore: 10,
      speakKind: 'mic-plain',
      speakQuestions: [blankSpeakQuestion('mic-plain')],
      questions: [],
    }
  }
  return {
    id: createId('p'),
    kind,
    title: '',
    questions: [blankQuestion()],
  }
}

export function blankStructure(index: number): ExamStructure {
  return {
    id: createId('s'),
    name: index === 0 ? 'Listening' : 'Reading - Writing',
    minutes: index === 0 ? 35 : 30,
    parts: [blankPart('gapfill')],
  }
}

export function blankExam(): Exam {
  return {
    id: createId('exam'),
    name: '',
    levelSlug: 'movers',
    levelName: 'MOVERS',
    isDemo: false,
    structures: [blankStructure(0), blankStructure(1)],
  }
}

export const PART_KIND_LABEL: Record<PartKind, string> = {
  dragdrop: 'Kéo & thả',
  matching: 'Nối từ',
  multichoice: 'Trắc nghiệm',
  gapfill: 'Điền từ',
  write: 'Viết (Writing)',
  speak: 'Nói (Speaking)',
}

export const PART_KINDS = Object.keys(PART_KIND_LABEL) as PartKind[]

export function structurePartCount(exam: Exam): number {
  return exam.structures.reduce((acc, s) => acc + s.parts.length, 0)
}
