# Phase 1 Web Implementation Plan (`luyenthiao.com-Web`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Note: per `.claude/rules/git.md`, NEVER run `git add`/`git commit` without explicit user approval.

**Goal:** Kết nối toàn bộ Quản lý Đề thi (`/admin/exam`, `/admin/exam/[id]`) và Media Picker với NestJS Backend + Cloudflare R2, bổ sung soạn thảo phần `write` & `speak`, xây dựng trang Kho câu hỏi (`/admin/questions` + chèn câu vào đề), và mở lối vào `/admin` cho tài khoản `ADMIN` trên giao diện học viên.

**Architecture:** Tách lớp API + Zod (`src/lib/api/admin/*`) gọi qua `authFetch<unknown>` + `parseOrThrow`, quản lý cache server bằng TanStack Query dưới namespace `queryKeys.admin()` (và dọn sạch trong `PrivateDataCleanup`), giữ `useExamEditorStore` chỉ phục vụ trạng thái nháp đang mở trong Editor. Tuân thủ nghiêm Light CMS Theme (`admin-light-theme.test.ts`), không HTML thô (`no-raw-html.test.ts`), import order, và cấu trúc `page.tsx` mỏng.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript strict, TanStack Query, Zod, Tailwind CSS v4, Vitest + React Testing Library.

**Spec tham chiếu:** [2026-11-26-admin-phase1-core-design.md](file:///D:/luyenthiao/luyenthiao.com-Web/.claude/superpowers/specs/2026-11-26-admin-phase1-core-design.md)

**Điều kiện tiên quyết:** Kế hoạch Backend ([2026-11-26-admin-phase1-backend.md](file:///D:/luyenthiao/luyenthiao.com-Backend/.claude/superpowers/plans/2026-11-26-admin-phase1-backend.md)) phải xong trước để Verify Tier 2 với `:3005`.

---

## File Structure

| File | Trách nhiệm | Hành động |
| :--- | :--- | :--- |
| `src/lib/api-client.ts` | Không ép `Content-Type: application/json` khi `body instanceof FormData` | Modify |
| `src/lib/api-client.test.ts` (hoặc test tương ứng) | Test `FormData` upload không gửi header JSON | Modify/Create |
| `src/lib/query-keys.ts` | Thêm `admin`, `adminExams`, `adminExam`, `adminQuestions`, `adminUploads`, `adminPlanets` | Modify |
| `src/providers/private-data-cleanup.tsx` (+ test) | Dọn thêm `queryKeys.admin()` khi logout/đổi user | Modify |
| `src/next.config.ts` | Thêm `images.remotePatterns` cho `*.r2.dev` & host R2 tùy biến | Modify |
| `src/schemas/exam.ts` | Mở rộng `examPartSchema` (`write`/`speak`/`maxScore`) & `examSchema` (`isDemo`/`order`/`id?`) | Modify |
| `src/types/exam.ts` | Mở rộng `PartKind`, `ExamPart`, `Exam` | Modify |
| `src/schemas/admin-question.ts` | Zod schema cho `QuestionDoc`, `SaveQuestionInput`, `PagedQuestions` | Create |
| `src/schemas/admin-upload.ts` | Zod schema cho `R2UploadItem`, `R2ListResponse`, `UploadResult` | Create |
| `src/schemas/admin-planet.ts` | Zod schema cho danh sách hành tinh admin (`GET /planets`) | Create |
| `src/lib/api/admin/exams.ts` | API client `listAdminExams`, `getAdminExam`, `createAdminExam`, `updateAdminExam`, `deleteAdminExam`, `toggleExamDemo` | Create |
| `src/lib/api/admin/questions.ts` | API client `listAdminQuestions`, `getAdminQuestion`, `createAdminQuestion`, `updateAdminQuestion`, `deleteAdminQuestion` | Create |
| `src/lib/api/admin/uploads.ts` | API client `listR2Uploads`, `uploadR2File`, `deleteR2Upload` | Create |
| `src/lib/api/admin/planets.ts` | API client `listAdminPlanets` | Create |
| `src/lib/api/admin/index.ts` | Barrel export cho admin API | Create |
| `src/hooks/admin/use-admin-exams.ts` | TanStack Query & Mutation hooks cho Exams | Create |
| `src/hooks/admin/use-admin-questions.ts` | TanStack Query & Mutation hooks cho Questions | Create |
| `src/hooks/admin/use-admin-uploads.ts` | TanStack Query & Mutation hooks cho R2 Uploads | Create |
| `src/hooks/admin/use-admin-planets.ts` | TanStack Query hook cho Planets | Create |
| `src/hooks/admin/index.ts` | Barrel export cho `hooks/admin` | Create |
| `src/components/admin/media/media-picker-field.tsx` | Hỗ trợ URL `/` và `https://`, preview `unoptimized` cho URL ngoài | Modify |
| `src/components/admin/media/media-browser-dialog.tsx` | 2 tab `Kho R2 (Cloud)` (upload/list/delete/503 banner) + `Tài nguyên sẵn` | Modify |
| `src/components/admin/media/media-components.test.tsx` | Tests mới cho tab R2, upload, xóa, trạng thái chưa cấu hình R2, Light theme | Modify |
| `src/lib/exam-blank.ts` | Cập nhật `PART_KIND_LABEL` thêm `write`, `speak`; default fields cho `blankPart('write'|'speak')` | Modify |
| `src/lib/admin-validate.ts` | Validate thêm cho `write` & `speak` parts | Modify |
| `src/lib/exam-grade.ts` | Bỏ qua phần `write` & `speak` khi chấm khách quan ở client | Modify |
| `src/components/exam/parts/part-write.tsx` | Renderer nhẹ cho xem trước phần `write` | Create |
| `src/components/exam/parts/part-speak.tsx` | Renderer nhẹ cho xem trước phần `speak` | Create |
| `src/components/exam/parts/index.ts` | Đăng ký `write` & `speak` vào `PART_RENDERERS` | Modify |
| `src/components/admin/exam/editor/form/part-form-write.tsx` | Form đầy đủ cho phần Viết (`WritingPrompt` + 3 ảnh + `maxScore`) | Create |
| `src/components/admin/exam/editor/form/part-form-speak.tsx` | Form cơ bản cho 6 dạng `speak` (`speakKind`, `maxScore`, danh sách `speakQuestions` + JSON nâng cao) | Create |
| `src/components/admin/exam/editor/form/part-forms-light-theme.test.tsx` | Bổ sung tests cho `PartFormWrite` & `PartFormSpeak` | Modify |
| `src/components/admin/exam/editor/question-bank-picker-dialog.tsx` | Dialog chọn câu từ Kho câu hỏi lọc theo `kind`/`level` để chèn vào đề | Create |
| `src/components/admin/exam/editor/part-card.tsx` | Mount `PartFormWrite`, `PartFormSpeak`, nút `Chèn từ kho`, ẩn `QuestionsJsonEditor` thừa ở `write` | Modify |
| `src/components/admin/exam/editor/exam-editor.tsx` | Nối `useAdminExam` + `create`/`update` API, chọn Hành tinh từ `/planets`, `order`, `isDemo`, bỏ ID `exam_...` khi POST | Modify |
| `src/components/admin/exam/exam-list-table.tsx` | Nối `useAdminExams` + tìm kiếm/lọc hành tinh + bật/tắt `Demo` + đồng bộ đề từ `localStorage` | Modify |
| `src/components/admin/exam/exam-list-table.test.tsx` | Cập nhật test theo React Query hooks + migration banner + toggle Demo | Modify |
| `src/components/admin/exam/editor/editor-light-theme.test.tsx` | Cập nhật mock/tests cho `ExamEditor` dùng API hooks + `write`/`speak` | Modify |
| `src/components/admin/questions/question-form-dialog.tsx` | Modal tạo/sửa câu hỏi trong kho | Create |
| `src/components/admin/questions/question-bank-view.tsx` | Bảng & bộ lọc `level`/`skill`/`kind`/search/pagination cho `/admin/questions` | Create |
| `src/components/admin/questions/index.ts` | Barrel export | Create |
| `src/components/admin/questions/question-bank-view.test.tsx` | Unit/component test + light theme check | Create |
| `src/app/admin/questions/page.tsx` | Route page mỏng với đủ 5 trường Metadata | Create |
| `src/constants/index.ts` | Thêm `ROUTES.ADMIN_QUESTIONS` | Modify |
| `src/components/admin/shell/admin-nav.ts` | Thêm mục `Kho câu hỏi` (`/admin/questions`) | Modify |
| `src/components/admin/shell/admin-sidebar.test.tsx` | Đảm bảo pass khi có thêm mục nav mới | Verify/Modify |
| `src/components/admin/overview/admin-overview.tsx` + `admin-overview.test.tsx` | Nối số liệu thật từ `useAdminExams` + `useAdminQuestions`, cập nhật Readiness Map | Modify |
| `src/components/common/topbar.tsx` + `mobile-nav-drawer.tsx` (+ test) | Thêm mục `"Quản trị CMS"` (`/admin`) khi `user?.role === 'ADMIN'` | Modify |

---

### Task 1: `api-client` FormData, `queryKeys.admin`, `PrivateDataCleanup`, `next.config.ts`

- [ ] **Step 1: Viết test thất bại**
  - Test `apiFetch` không gắn `Content-Type: application/json` khi `body` là `FormData`.
  - Test `PrivateDataCleanup` xóa cả `queryKeys.admin()` khi `clearSession()` hoặc đổi user.
- [ ] **Step 2: Chạy test xác nhận FAIL**
  `Set-Location "D:\luyenthiao\luyenthiao.com-Web\src"; npx vitest run providers/private-data-cleanup.test.tsx lib/api-client.test.ts --maxWorkers=2 --testTimeout=15000`
- [ ] **Step 3: Sửa `src/lib/api-client.ts`, `src/lib/query-keys.ts`, `src/providers/private-data-cleanup.tsx`, `src/next.config.ts`**
  - Trong `apiFetch`: `...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {})`.
  - Trong `queryKeys`: thêm `admin: () => ['admin'] as const`, `adminExams`, `adminExam(id)`, `adminQuestions(params?)`, `adminUploads(params?)`, `adminPlanets()`.
  - Trong `next.config.ts`: thêm `images: { remotePatterns }` hỗ trợ `https://*.r2.dev/**` (cộng host tùy biến từ `process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL` nếu hợp lệ).
- [ ] **Step 4: Chạy lại test xác nhận PASS**

### Task 2: Schemas, Admin API Clients & TanStack Query Hooks

- [ ] **Step 1: Viết tests parse & API client** (`src/lib/api/admin/*.test.ts`)
  Verify Zod schemas + `parseOrThrow` cho `exams`, `questions`, `uploads` (kể cả `configured: false` & `503`), `planets`; verify `createAdminExam` loại bỏ `id` không phải UUID (như `exam_...`).
- [ ] **Step 2: Chạy test xác nhận FAIL**
- [ ] **Step 3: Mở rộng `src/types/exam.ts`, `src/schemas/exam.ts` (`write`/`speak`/`isDemo`/`order`) và tạo `src/schemas/admin-*.ts`, `src/lib/api/admin/*`, `src/hooks/admin/*`**
- [ ] **Step 4: Chạy test xác nhận PASS**

### Task 3: Nâng cấp `MediaPickerField` & `MediaBrowserDialog` (Kho R2 + Upload + Xóa + Tài nguyên sẵn)

- [ ] **Step 1: Viết/cập nhật tests trong `media-components.test.tsx`**
  Cover: chọn URL `https://pub-xxx.r2.dev/a.png`, tab **Kho R2 (Cloud)** vs **Tài nguyên sẵn**, upload file gọi `useUploadR2File`, xóa file gọi `useDeleteR2Upload`, hiển thị banner hướng dẫn khi `configured: false`, không chứa dark markers.
- [ ] **Step 2: Chạy test xác nhận FAIL**
- [ ] **Step 3: Cập nhật `media-picker-field.tsx` & `media-browser-dialog.tsx`**
- [ ] **Step 4: Chạy `media-components.test.tsx` + `admin-light-theme.test.ts` xác nhận PASS**

### Task 4: Mở rộng `PartWrite` / `PartSpeak` (Renderer + Form + Validate + Chèn từ Kho)

- [ ] **Step 1: Viết tests trong `part-forms-light-theme.test.tsx` & `admin-validate` test**
  Cover: `PartFormWrite` cập nhật `prompt`/`maxScore`, `PartFormSpeak` chọn `speakKind` + thêm/sửa `speakQuestions` + `maxScore`, `validateExam` bắt lỗi thiếu `prompt`/câu nói, `gradeExam` bỏ qua chấm `write`/`speak`.
- [ ] **Step 2: Chạy test xác nhận FAIL**
- [ ] **Step 3: Cập nhật `exam-blank.ts`, `admin-validate.ts`, `exam-grade.ts`, tạo `part-write.tsx`, `part-speak.tsx`, `part-form-write.tsx`, `part-form-speak.tsx`, `question-bank-picker-dialog.tsx`, cập nhật `part-card.tsx` & `parts/index.ts`**
- [ ] **Step 4: Chạy tests xác nhận PASS**

### Task 5: Kết nối `ExamListTable` & `ExamEditor` với `/api/exams` + Sync từ `localStorage`

- [ ] **Step 1: Cập nhật/viết tests trong `exam-list-table.test.tsx` & `editor-light-theme.test.tsx`**
  Cover: danh sách tải từ `useAdminExams`, bật/tắt `Demo` gọi `useToggleExamDemo`, banner đồng bộ khi `ela.exams.v1` còn đề cũ, `ExamEditor` tạo đề mới gọi `POST /api/exams` không mang `id` `exam_...`, chọn Hành tinh từ `/api/planets`, sửa đề gọi `PUT /api/exams/:id`.
- [ ] **Step 2: Chạy test xác nhận FAIL**
- [ ] **Step 3: Cập nhật `exam-list-table.tsx` & `exam-editor.tsx`**
- [ ] **Step 4: Chạy tests xác nhận PASS**

### Task 6: Trang Kho câu hỏi (`/admin/questions`), Mục Nav, Tổng quan CMS & Nút vào Admin

- [ ] **Step 1: Viết tests**
  - `question-bank-view.test.tsx`: lọc theo cấp độ/kỹ năng/dạng câu/tìm kiếm, mở modal tạo/sửa/xóa, phân trang, light theme check.
  - `admin-overview.test.tsx`: đọc số liệu từ `useAdminExams` + `useAdminQuestions`, kiểm tra trạng thái CMS Readiness Map đã cập nhật.
  - Test `Topbar` / `MobileNavDrawer` hiện nút **"Quản trị CMS"** (`/admin`) với `role === 'ADMIN'` và ẩn với `role === 'USER'` / chưa đăng nhập.
- [ ] **Step 2: Chạy test xác nhận FAIL**
- [ ] **Step 3: Triển khai `src/constants/index.ts`, `admin-nav.ts`, `src/components/admin/questions/*`, `src/app/admin/questions/page.tsx`, `admin-overview.tsx`, `topbar.tsx`, `mobile-nav-drawer.tsx`, cập nhật `src/components/admin/index.ts`**
- [ ] **Step 4: Chạy tests xác nhận PASS**

### Task 7: Verification Toàn diện (Tier 1 + Tier 2 Real Backend + Live Browser)

- [ ] **Step 1: Web Tier 1** (từ `D:\luyenthiao\luyenthiao.com-Web\src`):
  - `npx prettier --write ...` trên các file đã sửa/tạo
  - `npx tsc --noEmit` (0 errors)
  - `npm run lint` (không tăng lỗi baseline)
  - `npx vitest run --maxWorkers=2 --testTimeout=15000` (full suite pass)
  - `npm run build` (pass hoàn chỉnh)
- [ ] **Step 2: Tier 2 E2E Thực tế (`Backend :3005` + `Web :3001` hoặc `:3000`)**
  - Mở trình duyệt bằng `browser` subagent, đăng nhập tài khoản `ADMIN` qua UI, kiểm tra nút **Quản trị CMS** trên Topbar → vào `/admin` → `/admin/exam` → `/admin/exam/new` → tạo đề gồm cả phần `write`/`speak` → chèn câu từ Kho câu hỏi → mở `MediaBrowserDialog` kiểm tra tab Kho R2 & tab Tài nguyên sẵn → qua `/admin/questions` kiểm tra câu hỏi vừa đồng bộ & tạo/sửa/xóa câu hỏi → xác nhận không có lỗi console/hydration/network bất ngờ.
