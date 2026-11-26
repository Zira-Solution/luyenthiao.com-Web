'use client'

import {
  ArrowRight,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileText,
  Layers,
  Plus,
  Sparkles,
  Swords,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'

import { AdminPageHeader } from '@/components/admin/shell'
import { ROUTES } from '@/constants'
import { useAdminExams, useAdminQuestions, useAdminStats } from '@/hooks/admin'

interface CmsModuleStatus {
  name: string
  endpoint: string
  href: string
  statusLabel: string
  description: string
}

const CMS_MODULES: readonly CmsModuleStatus[] = [
  {
    name: 'Quản lý đề thi & trình soạn thảo',
    endpoint: '/api/exams',
    href: ROUTES.ADMIN_EXAM,
    statusLabel: 'Đã kết nối API',
    description:
      'Đồng bộ trực tiếp DB, bật/tắt đề Demo, thứ tự hiển thị và đủ 6 dạng phần thi (gồm Write/Speak).',
  },
  {
    name: 'Kho câu hỏi dùng chung',
    endpoint: '/api/questions',
    href: ROUTES.ADMIN_QUESTIONS,
    statusLabel: 'Đã kết nối API',
    description: 'Lọc theo hành tinh, kỹ năng, loại câu, CRUD đầy đủ và chèn nhanh vào đề thi.',
  },
  {
    name: 'Thư viện Media & Cloudflare R2',
    endpoint: '/api/uploads',
    href: ROUTES.ADMIN_EXAM,
    statusLabel: 'Đã kết nối API',
    description:
      'Tải ảnh/âm thanh lên R2, duyệt & xóa file trên Cloud và fallback mượt tài nguyên có sẵn.',
  },
  {
    name: 'Chấm bài Speaking & Writing',
    endpoint: '/api/speaking-submissions · /api/writing-submissions',
    href: ROUTES.ADMIN_GRADING,
    statusLabel: 'Đã kết nối API',
    description:
      'Hàng đợi chấm điểm thủ công, nghe audio R2, rubric chi tiết và cộng lại tổng điểm.',
  },
  {
    name: 'Hành tinh & Cấu hình trang chủ',
    endpoint: '/api/planets · /api/site-config',
    href: ROUTES.ADMIN_PLANETS,
    statusLabel: 'Đã kết nối API',
    description: 'Quản lý đảo học tập, sắp xếp thứ tự, 11 nhóm ảnh/nhãn giao diện và ngôn ngữ.',
  },
  {
    name: 'Từ vựng, Nhiệm vụ, Trường, Users & Giám sát',
    endpoint: '/api/vocab · /tasks · /schools · /notifications · /users · /admin/*',
    href: ROUTES.ADMIN_USERS,
    statusLabel: 'Đã kết nối API',
    description:
      'Quản trị trọn vẹn từ vựng, nhiệm vụ, trường học, thông báo, người dùng và giám sát đấu trường.',
  },
]

export function AdminOverview(): ReactElement {
  const { data: exams = [] } = useAdminExams()
  const { data: questionsData } = useAdminQuestions({ page: 1, limit: 1 })
  const { data: stats } = useAdminStats()

  const totalParts = exams.reduce(
    (sum, exam) => sum + exam.structures.reduce((partSum, st) => partSum + st.parts.length, 0),
    0,
  )
  const uniqueLevels = new Set(
    exams.map((exam) => (exam.levelSlug || exam.levelName).trim()).filter(Boolean),
  ).size
  const recentExams = exams.slice(0, 5)
  const totalQuestions = stats?.questionsTotal ?? questionsData?.total ?? 0
  const pendingGrading = (stats?.writingPending ?? 0) + (stats?.speakingPending ?? 0)

  return (
    <>
      <AdminPageHeader
        title="Tổng quan quản trị"
        description="Trung tâm quản lý nội dung, đề thi, chấm bài, người dùng và giám sát toàn hệ thống Luyenthiao."
        breadcrumbs={[{ label: 'Trang chủ', href: ROUTES.HOME }, { label: 'Tổng quan' }]}
        actions={
          <Link
            href={`${ROUTES.ADMIN_EXAM}/new`}
            className="bg-admin-primary hover:bg-admin-primary-hover inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white shadow-xs transition-colors"
          >
            <Plus className="size-4" aria-hidden="true" />
            Tạo đề mới
          </Link>
        }
      />

      {/* Row 1: Content & Catalog KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          data-testid="kpi-exams"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng số đề thi</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <FileText className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {stats?.examsTotal ?? exams.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Đồng bộ trực tiếp qua /api/exams</p>
        </div>

        <div
          data-testid="kpi-parts"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng số phần thi</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{totalParts}</p>
          <p className="mt-1 text-xs text-slate-500">Cộng dồn qua các cấu trúc đề</p>
        </div>

        <div
          data-testid="kpi-levels"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cấp độ hiện có</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {uniqueLevels}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stats?.planetsTotal
              ? `${stats.planetsTotal} hành tinh trong DB`
              : 'Nhóm hành tinh đã gán đề thi'}
          </p>
        </div>

        <div
          data-testid="kpi-questions"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Kho câu hỏi</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Database className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {totalQuestions}
          </p>
          <p className="mt-1 text-xs text-slate-500">Câu hỏi dùng chung trên máy chủ</p>
        </div>
      </div>

      {/* Row 1B: Live Platform Operations KPIs (/admin/stats) */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div
          data-testid="kpi-users"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Người dùng hệ thống</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {stats?.usersTotal ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Đang khóa: {stats?.usersBanned ?? 0} · Trường: {stats?.schoolsTotal ?? 0}
          </p>
        </div>

        <div
          data-testid="kpi-grading"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chờ chấm Speaking/Writing</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <ClipboardCheck className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {pendingGrading}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Writing: {stats?.writingPending ?? 0} · Speaking: {stats?.speakingPending ?? 0}
          </p>
        </div>

        <div
          data-testid="kpi-attempts"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lượt nộp bài thi</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <FileCheck2 className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {stats?.attemptsTotal ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Từ vựng: {stats?.vocabTotal ?? 0}</p>
        </div>

        <div
          data-testid="kpi-challenges"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Trận đấu Thách đấu</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Swords className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {stats?.challengesTotal ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-500">Nhiệm vụ: {stats?.tasksTotal ?? 0}</p>
        </div>
      </div>

      {/* Row 2: Recent exams + Quick workspace panels */}
      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Đề thi gần đây</h2>
              <p className="text-xs text-slate-500">
                Danh sách đề mới cập nhật từ máy chủ để chỉnh sửa hoặc kiểm tra nhanh.
              </p>
            </div>
            <Link
              href={ROUTES.ADMIN_EXAM}
              className="text-admin-primary hover:text-admin-primary-hover text-xs font-semibold hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          {recentExams.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-slate-800">Chưa có đề thi nào</p>
              <p className="mt-1 text-xs text-slate-500">
                Bấm Tạo đề mới ở góc trên hoặc vào trang Quản lý đề thi để nhập file JSON.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentExams.map((exam) => {
                const partCount = exam.structures.reduce((a, s) => a + s.parts.length, 0)
                return (
                  <Link
                    key={exam.id}
                    href={`${ROUTES.ADMIN_EXAM}/${exam.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {exam.name || '(chưa đặt tên)'}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-slate-500">{exam.id}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      {exam.isDemo && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Demo
                        </span>
                      )}
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {exam.levelName || exam.levelSlug || 'Chưa gắn'}
                      </span>
                      <span className="text-xs text-slate-500">{partCount} phần</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <Link
            href={ROUTES.ADMIN_EXAM}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Quản lý đề thi</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Soạn cấu trúc đề, phần Write/Speak, bật Demo, gán thứ tự và tải media R2.
              </p>
            </div>
            <span className="ml-4 flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:bg-white group-hover:text-slate-900">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href={ROUTES.ADMIN_QUESTIONS}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Kho câu hỏi</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Tra cứu câu hỏi theo hành tinh, kỹ năng, dạng bài và chèn thẳng vào đề thi.
              </p>
            </div>
            <span className="ml-4 flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:bg-white group-hover:text-slate-900">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>

          <Link
            href={ROUTES.ADMIN_GRADING}
            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Chấm bài tự luận</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Nghe audio R2 bài nói Speaking, chấm rubric Writing ({pendingGrading} bài chờ).
              </p>
            </div>
            <span className="ml-4 flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:bg-white group-hover:text-slate-900">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>

      {/* Row 3: Module readiness map */}
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-slate-900">Lộ trình phân hệ Admin CMS</h2>
          <p className="text-xs text-slate-500">
            Tổng hợp toàn bộ phân hệ quản trị đã tích hợp đầy đủ với API Backend.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2">
          {CMS_MODULES.map((mod) => (
            <Link
              key={mod.name}
              href={mod.href}
              className="flex flex-col justify-between gap-2 bg-white p-5 transition-colors hover:bg-slate-50"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{mod.name}</h3>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
                  {mod.statusLabel}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{mod.description}</p>
              <p className="font-mono text-[11px] text-slate-500">{mod.endpoint}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
