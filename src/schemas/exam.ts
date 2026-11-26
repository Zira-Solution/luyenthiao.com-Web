import { z } from '@/lib/zod'

const boxSchema = z.object({
  left: z.string(),
  top: z.string(),
  width: z.string(),
  height: z.string(),
})

const wordBoxItemSchema = z.object({
  label: z.string(),
  imageId: z.string().nullable().optional(),
})

const examDetailSchema = z.object({
  id: z.string(),
  label: z.string().default(''),
  box: boxSchema.nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  text: z.string().nullable().optional(),
  correctAnswers: z.array(z.string()).default([]),
  options: z.array(z.string()).optional(),
})

export const examQuestionSchema = z.object({
  id: z.string(),
  isExample: z.boolean().default(false),
  title: z.string().nullable().optional(),
  promptHtml: z.string().nullable().optional(),
  choices: z.array(wordBoxItemSchema).optional(),
  correctLabel: z.string().nullable().optional(),
  details: z.array(examDetailSchema).default([]),
  skillTags: z.array(z.string()).optional(),
})

const writingStoryImageSchema = z.object({
  slot: z.enum(['story-img-1', 'story-img-2', 'story-img-3']),
  src: z.string().nullable(),
  alt: z.string(),
})

export const writingPromptSchema = z.object({
  title: z.string().default(''),
  instruction: z.string().default(''),
  images: z.array(writingStoryImageSchema).default([]),
  sampleAnswer: z.string().default(''),
})

export const speakingKindSchema = z.enum([
  'scene-mark',
  'choose-object',
  'drag-object',
  'mic-answer',
  'mic-zoom',
  'mic-plain',
])

export const speakingQuestionSchema = z.object({
  id: z.string(),
  kind: speakingKindSchema,
  partTitle: z.string().optional(),
  text: z.string(),
  vi: z.string().optional(),
  sceneBg: z.string().optional(),
  scene: z
    .array(
      z.object({
        id: z.string(),
        src: z.string(),
        label: z.string(),
        top: z.number(),
        left: z.number(),
        width: z.number(),
        height: z.number(),
      }),
    )
    .optional(),
  correctSlotId: z.string().optional(),
  palette: z
    .array(
      z.object({
        id: z.string(),
        src: z.string(),
        label: z.string(),
      }),
    )
    .optional(),
  correctDraggableId: z.string().optional(),
  correctTargetId: z.string().optional(),
  choices: z
    .array(
      z.object({
        id: z.string(),
        src: z.string(),
        label: z.string(),
        correct: z.boolean(),
      }),
    )
    .optional(),
  correctChoiceId: z.string().optional(),
  pointer: z.object({ top: z.number(), left: z.number() }).optional(),
  cards: z.array(z.object({ src: z.string(), label: z.string() })).optional(),
  zoomCard: z.string().optional(),
})

export const examPartSchema = z.object({
  id: z.string(),
  kind: z.enum(['dragdrop', 'matching', 'multichoice', 'gapfill', 'write', 'speak']),
  title: z.string().default(''),
  audioUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  wordBox: z.array(wordBoxItemSchema).optional(),
  extraHtml: z.string().nullable().optional(),
  questions: z.array(examQuestionSchema).default([]),
  maxScore: z.number().optional(),
  prompt: writingPromptSchema.nullable().optional(),
  speakKind: speakingKindSchema.nullable().optional(),
  speakQuestions: z.array(speakingQuestionSchema).optional(),
})

export const examStructureSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  minutes: z.number().default(15),
  parts: z.array(examPartSchema),
})

export const examSchema = z.object({
  id: z.string(),
  name: z.string(),
  levelSlug: z.string(),
  levelName: z.string().default(''),
  isDemo: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  structures: z.array(examStructureSchema),
})

export type ExamSchema = z.infer<typeof examSchema>
