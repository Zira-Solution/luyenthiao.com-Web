'use client'

import type { ReactElement } from 'react'

import { PART_RENDERERS } from '@/components/exam/parts'
import type { ExamPart } from '@/types/exam'

export interface PartPreviewProps {
  part: ExamPart
  structureName: string
}

export function PartPreview({ part, structureName }: PartPreviewProps): ReactElement {
  const Renderer = PART_RENDERERS[part.kind]
  return (
    <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xs">
      <Renderer part={part} structureName={structureName} answers={{}} onChange={() => {}} />
    </div>
  )
}
