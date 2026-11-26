import { PartDragdrop } from './part-dragdrop'
import { PartGapfill } from './part-gapfill'
import { PartMatching } from './part-matching'
import { PartMultichoice } from './part-multichoice'
import { PartSpeak } from './part-speak'
import { PartWrite } from './part-write'
import type { PartRenderer } from './types'

import type { PartKind } from '@/types/exam'

export const PART_RENDERERS: Record<PartKind, PartRenderer> = {
  dragdrop: PartDragdrop,
  matching: PartMatching,
  multichoice: PartMultichoice,
  gapfill: PartGapfill,
  write: PartWrite,
  speak: PartSpeak,
}

export { PartWrite }
export type {
  PartRenderer,
  PartRendererProps,
  ReviewContext,
  SpeakingRecordedBlobEntry,
} from './types'
