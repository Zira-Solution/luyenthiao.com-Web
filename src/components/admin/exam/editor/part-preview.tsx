"use client"

import type { ReactElement } from "react"

import { PART_RENDERERS } from "@/components/exam"
import type { ExamPart } from "@/types/exam"

interface PartPreviewProps {
  part: ExamPart
  structureName: string
}

export function PartPreview({ part, structureName }: PartPreviewProps): ReactElement {
  const Renderer = PART_RENDERERS[part.kind]
  return (
    <div className="bg-white rounded-3xl p-5 shadow-xl text-slate-900 max-h-[560px] overflow-auto">
      <Renderer part={part} structureName={structureName} answers={{}} onChange={() => {}} />
    </div>
  )
}