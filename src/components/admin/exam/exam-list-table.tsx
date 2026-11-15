"use client"

import { Check, Copy, FileDown, FileUp, Pencil, Play, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, type ReactElement } from "react"

import { createId } from "@/lib/exam-blank"
import { cn } from "@/lib/utils"
import { useExamStore } from "@/store/exam-store"

export function ExamListTable(): ReactElement {
  const router = useRouter()
  const exams = useExamStore((s) => s.exams)
  const hydrate = useExamStore((s) => s.hydrate)
  const add = useExamStore((s) => s.add)
  const remove = useExamStore((s) => s.remove)
  const exportAll = useExamStore((s) => s.exportAll)
  const importFromFile = useExamStore((s) => s.importFromFile)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const handleRemove = (id: string, name: string) => {
    if (window.confirm(`Xóa đề thi "${name}"?`)) remove(id)
  }

  const handleDuplicate = (exam: (typeof exams)[number]) => {
    const copy = JSON.parse(JSON.stringify(exam)) as (typeof exams)[number]
    copy.id = createId("exam")
    copy.name = `${exam.name || "(chưa đặt tên)"} (bản sao)`
    copy.structures = copy.structures.map((s) => ({ ...s, id: createId("s") }))
    add(copy)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await importFromFile(file)
    window.alert(
      `Nhập xong: ${result.added} đề hợp lệ đã ghi vào (đề trùng id sẽ bị ghi đè), ${result.skipped} đề sai định dạng đã bỏ qua.`,
    )
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="min-h-screen bg-dashboard-bg font-sans">
      <header className="border-b border-white/10 bg-topbar-login-bg/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-white font-heading text-2xl font-black uppercase tracking-wide">
              Quản lý đề thi
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Tạo, sửa, xóa các đề thi được lưu cục bộ trên trình duyệt.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/admin/exam/new")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-game-cta-to hover:bg-game-cta-from text-white font-black text-sm uppercase transition-colors cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Tạo đề mới
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase transition-colors cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              Nhập
            </button>
            <button
              onClick={exportAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Xuất
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {exams.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <p className="text-white/80 font-black text-lg">Chưa có đề thi nào</p>
            <p className="text-white/50 text-sm mt-2">
              Bấm &quot;Tạo đề mới&quot; để bắt đầu, hoặc &quot;Nhập&quot; để tải lên file JSON.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-black">Tên đề</th>
                  <th className="px-5 py-3.5 font-black hidden md:table-cell">Cấp độ</th>
                  <th className="px-5 py-3.5 font-black">Cấu trúc</th>
                  <th className="px-5 py-3.5 font-black text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {exams.map((exam) => {
                  const partCount = exam.structures.reduce((a, s) => a + s.parts.length, 0)
                  return (
                    <tr key={exam.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/admin/exam/${exam.id}`)}
                          className="text-left text-white font-bold hover:text-game-accent transition-colors"
                        >
                          {exam.name || "(chưa đặt tên)"}
                        </button>
                        <div className="text-white/40 text-xs mt-0.5 font-mono">{exam.id}</div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-black">
                          {exam.levelName || exam.levelSlug || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {exam.structures.map((s) => (
                            <span key={s.id} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70 text-[11px] font-bold">
                              {s.name}
                              <span className="text-white/40"> · {s.parts.length}</span>
                            </span>
                          ))}
                        </div>
                        <div className="text-white/40 text-[11px] mt-1 font-bold">Tổng {partCount} phần</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            title="Làm bài"
                            onClick={() => router.push(`/check-point/${exam.id}`)}
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            title="Sửa"
                            onClick={() => router.push(`/admin/exam/${exam.id}`)}
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            title="Nhân bản"
                            onClick={() => handleDuplicate(exam)}
                            className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            title="Xóa"
                            onClick={() => handleRemove(exam.id, exam.name)}
                            className={cn(
                              "w-9 h-9 rounded-lg bg-white/10 hover:bg-game-danger-to flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer",
                            )}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2 text-white/40 text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400" />
          Dữ liệu lưu cục bộ trong trình duyệt (localStorage). Không có backend.
        </div>
      </main>
    </div>
  )
}