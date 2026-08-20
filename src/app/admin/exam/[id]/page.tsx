import type { Metadata } from "next"
import type { ReactElement } from "react"

import { ExamEditor } from "@/components/admin/exam/editor/exam-editor"

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: "Sửa đề thi | English Game Admin",
  description: "Chỉnh sửa nội dung đề thi tiếng Anh.",
  robots: { index: false, follow: false },
}

export default async function AdminExamEditorPage({ params }: PageProps): Promise<ReactElement> {
  const { id } = await params
  return <ExamEditor examId={id} />
}