import type { Metadata } from "next"
import type { ReactElement } from "react"

import { ExamListTable } from "@/components/admin/exam/exam-list-table"

export const metadata: Metadata = {
  title: "Quản lý đề thi | English Game Admin",
  description: "Tạo, sửa, xóa và xuất/nhập các đề thi tiếng Anh lưu cục bộ.",
  keywords: ["admin", "đề thi", "exam", "English Game"],
  robots: { index: false, follow: false },
  openGraph: {
    title: "Quản lý đề thi | English Game Admin",
    description: "Công cụ quản lý đề thi.",
  },
}

export default function AdminExamsPage(): ReactElement {
  return <ExamListTable />
}