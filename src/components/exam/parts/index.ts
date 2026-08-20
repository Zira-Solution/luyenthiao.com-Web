
import { PartDragdrop } from "./part-dragdrop"
import { PartGapfill } from "./part-gapfill"
import { PartMatching } from "./part-matching"
import { PartMultichoice } from "./part-multichoice"
import type { PartRenderer } from "./types"

import type { PartKind } from "@/types/exam"

export const PART_RENDERERS: Record<PartKind, PartRenderer> = {
  dragdrop: PartDragdrop,
  matching: PartMatching,
  multichoice: PartMultichoice,
  gapfill: PartGapfill,
}

export type { PartRenderer, PartRendererProps, ReviewContext } from "./types"