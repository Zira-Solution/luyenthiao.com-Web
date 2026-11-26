# Spec Web: Giai đoạn 2 — Hàng đợi & Màn hình Chấm bài Speaking & Writing (`/admin/grading`)

**Ngày:** 2026-11-26  
**Liên kết tài liệu Backend:** `../luyenthiao.com-Backend/.claude/superpowers/specs/2026-11-26-admin-phase2-grading-backend-design.md`  
**Thứ tự triển khai:** Backend verify xong → Web (`luyenthiao.com-Web`) triển khai & verify Tier 1 + Tier 2.

---

## 1. Mục tiêu & Phạm vi

Xây dựng hoàn chỉnh phân hệ Chấm bài tự luận cho giáo viên/Admin trong CMS Light Theme:
1. Thêm mục **Chấm bài** (`/admin/grading`) vào `ADMIN_NAV` kèm badge tổng số bài `PENDING` (Speaking + Writing).
2. Trang hàng đợi `/admin/grading` gồm 2 tab **Writing** và **Speaking** (đồng bộ qua query `?tab=writing|speaking`), bộ lọc trạng thái (`Tất cả | Chờ chấm | Đã chấm`), tìm kiếm học viên/đề thi, phân trang, và hỗ trợ cả chấm mới lẫn chấm lại bài `GRADED`.
3. Hai trang chi tiết bố cục 2 cột:
   - `/admin/grading/writing/[id]`: hiển thị đề bài Writing (chỉ dẫn, 3 ảnh minh họa, đáp án mẫu thu gọn), bài viết học viên (text an toàn, đếm từ), khối gợi ý AI read-only (nếu DB có `aiScore`/`aiFeedback`), và form chấm điểm nguyên `0..maxScore` + rubric `{ comment, errors, tips }` khớp màn xem lại của học viên.
   - `/admin/grading/speaking/[id]`: hiển thị danh sách câu hỏi Speaking kèm ảnh/câu hỏi đối chiếu từ đề thi, đáp án đã chọn & `autoScore`, trình phát audio cho file ghi âm R2 (với cảnh báo rõ nếu bản ghi chỉ có `blob:` cục bộ phía học viên hoặc thiếu file), gợi ý AI read-only (nếu có), và form chấm `manualScore` (`0..maxScore`) + `feedback` text.
   - Cả hai trang chi tiết đều có 2 nút hành động: **"Lưu điểm"** và **"Lưu & Chấm tiếp"** (lưu xong tự động chuyển sang bài `PENDING` kế tiếp cùng kỹ năng, hoặc quay về hàng đợi kèm thông báo khi đã chấm hết).

**Ngoài phạm vi Giai đoạn 2:**
- Không xây mới chức năng AI tự chấm hoặc sửa luồng nộp bài công khai của học viên (thuộc Giai đoạn khác).
- Quản trị Hành tinh, Trang chủ, Từ vựng, Nhiệm vụ, Trường, Thông báo, Users nằm ở Giai đoạn 3–5.

---

## 2. Kiến trúc & Hợp đồng Dữ liệu Web

### 2.1. Routes, Nav & Query Keys
- `src/constants/index.ts`: bổ sung vào `ROUTES`:
  - `ADMIN_GRADING: '/admin/grading'`
  - `ADMIN_GRADING_WRITING: '/admin/grading/writing/[id]'`
  - `ADMIN_GRADING_SPEAKING: '/admin/grading/speaking/[id]'`
- `src/components/admin/shell/admin-nav.ts`:
  - Thêm nhóm `{ label: 'Đánh giá', items: [{ label: 'Chấm bài', href: '/admin/grading', icon: ClipboardCheck, badgeKey: 'pendingGrading' }] }`.
- `src/components/admin/shell/admin-sidebar.tsx`:
  - Hỗ trợ `badgeKey?: 'pendingGrading'`: đọc tổng số bài `PENDING` từ hook nhẹ (`useAdminGradingCounts`, chỉ kích hoạt query khi `QueryClientContext` sẵn có để không phá test đơn vị render `<AdminSidebar />` độc lập).
  - Giữ `aria-label={item.label}` trên `<Link>` và đánh dấu badge bằng `aria-hidden="true"` (hoặc text phụ tách biệt khỏi tên link) để giữ nguyên accessibility và các test `getByRole('link', { name: item.label })`.
- `src/lib/query-keys.ts`: bổ sung trong nhóm `admin`:
  - `adminWritingQueue: (params?: AdminGradingQueueQueryParams) => ['admin', 'grading', 'writing', 'queue', params ?? {}] as const`
  - `adminWritingSubmission: (id: string) => ['admin', 'grading', 'writing', 'detail', id] as const`
  - `adminSpeakingQueue: (params?: AdminGradingQueueQueryParams) => ['admin', 'grading', 'speaking', 'queue', params ?? {}] as const`
  - `adminSpeakingSubmission: (id: string) => ['admin', 'grading', 'speaking', 'detail', id] as const`
  - `adminGradingCounts: () => ['admin', 'grading', 'counts'] as const`
- Mọi query đều bắt đầu bằng `'admin'` nên `PrivateDataCleanup` tự xóa khi đăng xuất / đổi tài khoản.

### 2.2. Schemas, API Clients & Hooks (`src/schemas/admin-grading.ts`, `src/lib/api/admin/grading.ts`, `src/hooks/admin/use-admin-grading.ts`)
- Validate toàn bộ payload từ API bằng `zod` qua `authFetch<unknown>` + `parseOrThrow(...)`.
- **`WritingFeedback` structured schema:**
  - `normalizeWritingFeedback(raw)`: đọc `{ comment, errors, tips }` từ `feedback` Json; nếu null hoặc partial, điền `''` an toàn.
- **DTO gửi lên khi chấm:**
  - `GradeWritingInput`: `{ score: number (int, 0..maxScore), feedback: { comment: string, errors: string, tips: string } }` → `PUT /writing-submissions/:id/grade`.
  - `GradeSpeakingInput`: `{ manualScore: number (int, 0..maxScore), feedback: string }` → `PUT /speaking-submissions/:id/grade`.
- **Trích xuất ngữ cảnh đề thi (`src/lib/admin-grading.ts`):**
  - `extractSubmissionPartContext(submission, kind: 'write' | 'speak')`: duyệt `submission.examAttempt?.exam?.data?.structures[*].parts`, khớp theo `submission.partId` (fallback về part đầu tiên có `kind` tương ứng); trả `{ part, maxScore, examDeleted }` với `maxScore` mặc định `5` (`write`) hoặc `10` (`speak`) khớp logic Backend.
  - `resolveSpeakingAnswerAudio(answer)`: trả về `{ kind: 'audio', url: string } | { kind: 'blob-only', blobUrl: string } | { kind: 'none' }`:
    - Nếu `answer.audioUrl` là chuỗi khác rỗng:
      - Chấp nhận `https://...` / `http://...` (từ chối mọi scheme khác).
      - Nếu bắt đầu bằng `/rec/` hoặc `/` và có `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` → ghép `${baseUrl}${audioUrl}`, ngược lại giữ nguyên path `/...` (nếu không cấu hình base URL thì UI ghi chú đường dẫn tương đối để người dùng kiểm tra R2).
    - Nếu không có `audioUrl` nhưng có `blobUrl` bắt đầu bằng `blob:` → trả `blob-only` để UI hiển thị cảnh báo thân thiện.

### 2.3. Giao diện & Hành vi Từng Màn hình
- **Theme & Bảo mật:** toàn bộ component mới dưới `src/components/admin/grading/` bắt buộc tuân thủ Light Theme (`admin-light-theme.test.ts` — không dùng `bg-slate-900`, `bg-white/\d`, `backdrop-blur`, `bg-game-*`...) và không dùng bất kỳ HTML sink thô nào (`no-raw-html.test.ts`). Hiển thị `answerText`, `feedback`, tên học viên dưới dạng text React thuần (JSX escaping).
- **1) `/admin/grading` (`GradingQueueView`):**
  - Page route thin orchestrator (`src/app/admin/grading/page.tsx`, đầy đủ 5 field `metadata` + `robots: noindex`).
  - Đọc `tab` từ `useSearchParams()` (`'writing'` mặc định hoặc `'speaking'`), bấm tab đổi URL sạch sẽ qua `router.replace`.
  - Thanh bộ lọc: 3 pill trạng thái (`Tất cả`, `Chờ chấm`, `Đã chấm` mặc định chọn `Chờ chấm` hoặc `Tất cả` — mặc định `PENDING` giúp giáo viên vào là thấy bài cần chấm ngay, có pill `Tất cả` & `Đã chấm` rõ ràng), ô tìm kiếm tên/username/email/đề thi, nút làm mới.
  - Bảng responsive: hiển thị học viên, đề thi & hành tinh, tóm tắt bài nộp (số từ với Writing; `autoScore` + số câu ghi âm với Speaking), điểm hiện tại, trạng thái (`Chờ chấm` màu hổ phách / `Đã chấm` màu xanh ngọc), thời gian nộp, nút hành động dẫn tới `/admin/grading/writing/[id]` hoặc `/admin/grading/speaking/[id]`.
  - Phân trang `20` dòng/trang với nút Trước/Sau.
- **2) `/admin/grading/writing/[id]` (`WritingGradingView`):**
  - Route thin `src/app/admin/grading/writing/[id]/page.tsx`.
  - Bố cục 2 cột `lg:grid-cols-[1.45fr_1fr]`:
    - **Trái:** Thẻ đề bài (`WritingPrompt.title`, `instruction`, 3 ảnh `WritingStoryImage` dùng `<img ...>` hoặc `<Image unoptimized>` hỗ trợ `/` & `https://`, khối Đáp án mẫu có nút Hiện/Ẩn), thẻ Bài làm học viên (`answerText`, số từ `wordCount`, ngày nộp), thẻ Gợi ý AI (`aiScore`, `aiFeedback` — chỉ hiện khi có ít nhất 1 trong 2 giá trị).
    - **Phải (sticky):** Khung chấm điểm — hiển thị badge trạng thái, thông tin người/thời điểm đã chấm (nếu `GRADED`), input số nguyên `score` (`min=0`, `max=maxScore`) kèm báo lỗi ngay nếu vượt `maxScore` hoặc không phải số nguyên, 3 ô textarea cho `comment`, `errors`, `tips`, nút **"Lưu điểm"** và **"Lưu & Chấm tiếp"**.
- **3) `/admin/grading/speaking/[id]` (`SpeakingGradingView`):**
  - Route thin `src/app/admin/grading/speaking/[id]/page.tsx`.
  - Bố cục 2 cột `lg:grid-cols-[1.45fr_1fr]`:
    - **Trái:** Thanh tóm tắt bài nói (`autoScore` tự động từ câu slide tương tác, thời gian nộp) + danh sách từng câu hỏi từ `part.speakQuestions` ghép với `submission.answers[q.id]` (nếu đề gốc bị xóa hoặc có key ngoài danh sách vẫn hiển thị mọi entry trong `answers`): hiện số thứ tự, loại câu (`speakKind`), đề câu hỏi (`text` / `vi`), ảnh minh họa nếu có (`sceneBg` / `zoomCard`), đáp án tương tác (`selected`), thời lượng (`duration`), trình phát `<audio controls preload="metadata" src={...} />` cho bản thu R2 hoặc banner chú thích cho `blob-only` / chưa ghi âm. Kèm khối Gợi ý AI nếu `aiScore != null || aiFeedback`.
    - **Phải (sticky):** Khung chấm điểm — input số nguyên `manualScore` (`min=0`, `max=maxScore`), textarea `feedback` (nhận xét tổng quát), chú thích rõ tổng điểm `ExamAttempt` sẽ tự cộng lại sau khi lưu, nút **"Lưu điểm"** và **"Lưu & Chấm tiếp"**.
- **`AdminOverview` (`src/components/admin/overview/admin-overview.tsx`):**
  - Chuyển card **"Chấm bài Speaking & Writing"** trong CMS Module Readiness Map sang trạng thái `api-connected` (`'Đã kết nối API'`) kèm link nhanh tới `/admin/grading` và hiển thị badge/KPI số bài chờ chấm tổng hợp nếu cần mà không làm vỡ các assertion test hiện tại.

---

## 3. Kiểm thử Bắt buộc

- **Unit tests (Vitest + RTL):**
  - `src/schemas/admin-grading.test.ts`: parse đúng queue Paged response, chi tiết Writing & Speaking, chuẩn hóa `WritingFeedback`, xử lý `exam: null`.
  - `src/lib/admin-grading.test.ts`: `extractSubmissionPartContext` (khớp `partId`, fallback part cùng kind, fallback `maxScore` 5/10), `resolveSpeakingAnswerAudio` (`https://`, `/rec/...` có & không có env R2, từ chối `javascript:`, nhận diện `blob:`).
  - `src/lib/api/admin/grading.test.ts`: kiểm tra `listAdminWritingQueue`, `getAdminWritingSubmission`, `gradeWritingSubmission`, `listAdminSpeakingQueue`, `getAdminSpeakingSubmission`, `gradeSpeakingSubmission`.
  - `src/components/admin/grading/grading-views.test.tsx`: test `GradingQueueView` (chuyển tab Writing/Speaking, lọc trạng thái, tìm kiếm), `WritingGradingView` (validate điểm > `maxScore`, render đề bài & 3 ô feedback, gọi submit & Lưu và Chấm tiếp), `SpeakingGradingView` (render audio player R2, cảnh báo `blobUrl`, validate `manualScore`, gợi ý AI chỉ đọc).
  - Cập nhật `admin-overview.test.tsx` và chạy `admin-light-theme.test.ts` + `no-raw-html.test.ts` + `admin-sidebar.test.tsx`.
- **Tier 1:** `npx tsc --noEmit`, `npx eslint`, `npx vitest run`, `npm run build` (`next build`).
- **Tier 2 (Playwright Chromium thật với Backend `:3005` + Web `:3001`):**
  - Seed tạm 1 bài Writing `PENDING` + 1 bài Speaking `PENDING` (kèm câu ghi âm R2 URL mẫu & `blobUrl` + câu tương tác) gắn `ExamAttempt` thật qua DB/API trong phạm vi test.
  - Đăng nhập Admin → mở `/admin/grading` (và kiểm tra badge PENDING trên sidebar) → vào `/admin/grading/writing/[id]` kiểm tra validation điểm vượt `maxScore`, điền điểm + 3 ô feedback, bấm **Lưu & Chấm tiếp** hoặc **Lưu điểm** → kiểm tra chuyển sang `GRADED`, chấm lại sửa điểm → vào tab Speaking → mở `/admin/grading/speaking/[id]`, kiểm tra audio player/metadata, chấm `manualScore` + `feedback` → kiểm tra `ExamAttempt.score` được `recomputeTotal()` cập nhật chính xác → kiểm tra 0 console error, 0 page error, 0 horizontal overflow → dọn sạch dữ liệu test & tắt server tạm.
