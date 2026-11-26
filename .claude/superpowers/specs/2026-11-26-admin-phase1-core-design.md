# Spec: Giai đoạn 1 — Nền tảng API Admin, Media R2, Đề thi & Kho câu hỏi (Backend + Web)

**Ngày:** 2026-11-26  
**Thứ tự triển khai:** Backend (`luyenthiao.com-Backend`) hoàn thành và verify Tier 1 + Tier 2 trước → Web (`luyenthiao.com-Web`) triển khai và verify đối ứng.

---

## 1. Mục tiêu & Phạm vi

Chuyển phân hệ Đề thi và Thư viện Media trong `/admin` từ `localStorage` / file tĩnh sang tích hợp trực tiếp với NestJS Backend & Cloudflare R2, mở rộng đầy đủ 6 loại phần thi (bao gồm `write` và `speak`), xây dựng trang quản trị Kho câu hỏi (`/admin/questions`), và thêm lối vào `/admin` cho tài khoản `ADMIN` trên giao diện học viên.

**Ngoài phạm vi Giai đoạn 1 (thuộc Giai đoạn 2–5):**
- Không sửa luồng làm bài công khai `/check-point/[id]` của học viên (giữ xem trước trực tiếp bên trong Exam Editor).
- Chưa xây UI `/admin/grading`, `/admin/planets`, `/admin/site-config`, `/admin/vocab`, `/admin/tasks`, `/admin/schools`, `/admin/notifications`, `/admin/users`.

---

## 2. Hợp đồng Backend (`luyenthiao.com-Backend`)

### 2.1. `uploads` — Liệt kê & Xóa R2 + Degradation an toàn khi thiếu credentials
- **`UploadsService.isConfigured()`:** trả `true` khi đủ `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (tất cả khác rỗng sau `.trim()`).
- **`GET /api/uploads`** (`@UseGuards(JwtAuthGuard, AdminGuard)`):
  - Query: `prefix?: string`, `type?: 'image' | 'audio'`, `cursor?: string`, `limit?: string` (mặc định `48`, tối đa `100`).
  - Nếu `!isConfigured()` → trả HTTP `200`: `{ configured: false, items: [], nextCursor: null }`.
  - Khi configured → gọi `ListObjectsV2Command` (`MaxKeys`, `ContinuationToken`, `Prefix`). Nếu client không truyền `prefix`, tự động lọc bỏ các object bắt đầu bằng `rec/` (file ghi âm bài nói của học viên) để kho media CMS sạch.
  - Nếu có `type`: lọc theo phần mở rộng ảnh (`png|jpg|jpeg|webp|gif|svg`) hoặc âm thanh (`mp3|ogg|wav|m4a|webm`).
  - Response shape:
    ```ts
    {
      configured: boolean;
      items: Array<{
        key: string;
        url: string; // `${R2_PUBLIC_BASE_URL}/${key}`
        name: string;
        kind: 'image' | 'audio';
        size: number;
        lastModified: string | null;
      }>;
      nextCursor: string | null;
    }
    ```
- **`POST /api/uploads` & `POST /api/uploads/recording`:**
  - Nếu `!isConfigured()` → ném `ServiceUnavailableException('Chưa cấu hình Cloudflare R2 trên máy chủ.')` (HTTP `503`, thay vì crash 500 `ERR_INVALID_URL`).
- **`DELETE /api/uploads`** (`@UseGuards(JwtAuthGuard, AdminGuard)`, `@HttpCode(200)`):
  - Query: `key` (`string`, bắt buộc). Thiếu `key` hoặc chứa `..` / rỗng → `BadRequestException('Khóa file không hợp lệ.')`.
  - Nếu `!isConfigured()` → `ServiceUnavailableException('Chưa cấu hình Cloudflare R2 trên máy chủ.')`.
  - Gọi `DeleteObjectCommand` và trả `{ message: 'Đã xóa file.' }`.

### 2.2. `exams` — Bổ sung `isDemo`, `order`, kỹ năng `write`/`speak` & phân trang opt-in
- **`SaveExamDto`:** giữ nguyên không bật `whitelist: true`; thêm:
  - `isDemo?: boolean` (`@IsOptional()`, `@IsBoolean({ message: 'Trạng thái đề demo không hợp lệ' })`)
  - `order?: number` (`@IsOptional()`, `@IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })`, `@Min(0, { message: 'Thứ tự hiển thị không âm' })`)
- **`ToggleExamDemoDto`:** `{ isDemo!: boolean }` (`@IsBoolean({ message: 'Trạng thái đề demo không hợp lệ' })`).
- **`ExamsService`:**
  - `toDomain(row)` trả `{ ...doc, id: row.id, isDemo: row.isDemo }` (nếu `row.updatedAt` có giá trị ISO string thì có thể kèm `updatedAt?: string`, không làm hỏng `PublicExamDoc` / `ExamDoc`).
  - `create`: ghi `isDemo: dto.isDemo ?? false` (thay vì luôn `false`).
  - `update`: chỉ cập nhật cột `isDemo` khi `dto.isDemo !== undefined`; vẫn `indexQuestions()` và xóa cache `lha:exam:public*` + `lha:exam:public:${id}` + `lha:exam:public:demo`.
  - Thêm `setDemo(id: string, isDemo: boolean)`: cập nhật `isDemo`, xóa cache `CacheKeys.examPublic('demo')`, `CacheKeys.examPublic(id)`, và pattern `'lha:exam:public*'`.
  - `examSkills()`: ngoài `struct.skills` và `question.skillTags`, nếu `part.kind === 'write'` thêm `'writing'`; nếu `part.kind === 'speak'` thêm `'speaking'`.
- **`GET /api/exams`** (`AdminGuard`):
  - Giữ tương thích ngược: không truyền `page` → trả `ExamDoc[]` (lọc thêm theo `q` / `level` nếu có).
  - Truyền `page` (số nguyên `>= 1`) → trả `{ items: ExamDoc[], total: number, page: number, limit: number }`.
- **`PATCH /api/exams/:id/demo`** (`AdminGuard`): nhận `ToggleExamDemoDto`, trả `ExamDoc`. Đặt route rõ ràng không xung đột với `:id`.

### 2.3. `questions` — Phân trang & Tìm kiếm opt-in
- **`GET /api/questions`** (`AdminGuard`):
  - Query: `level?: string`, `skill?: string`, `kind?: string`, `q?: string`, `page?: string`, `limit?: string`.
  - Lọc `q` (không phân biệt hoa thường trên JSON nội dung / `kind` / `levelSlug`).
  - Không truyền `page` → giữ nguyên trả `QuestionDoc[]`.
  - Truyền `page` → trả `{ items: QuestionDoc[], total: number, page: number, limit: number }`.

---

## 3. Thiết kế Web (`luyenthiao.com-Web`)

### 3.1. Hạ tầng API Admin & Upload Multipart
- **`src/lib/api-client.ts`:** trong `apiFetch`, chỉ gắn `'Content-Type': 'application/json'` khi `init?.body !== undefined && !(init.body instanceof FormData)` để `authFetch` gửi file `FormData` đúng boundary.
- **`src/lib/query-keys.ts`:** bổ sung nhánh `admin` độc lập khỏi `me`:
  - `admin.exams(params?)`, `admin.exam(id)`, `admin.questions(params?)`, `admin.uploads(params?)`, `admin.planets()`.
- **API & Schemas (`src/lib/api/admin/` + `src/schemas/` + `src/hooks/admin/`):**
  - Dùng `authFetch<unknown>` + `parseOrThrow(zodSchema, res, endpoint)` theo rule dự án.
  - Không lưu danh sách đề/câu hỏi server vào Zustand (`useExamEditorStore` chỉ quản lý trạng thái bản nháp đang mở trong Editor).

### 3.2. Media R2 & Hình ảnh (`next.config.ts`, `MediaPickerField`, `MediaBrowserDialog`)
- **`src/next.config.ts`:** cấu hình `images.remotePatterns` cho `https://*.r2.dev/**` (và parse thêm host từ `process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL` nếu có).
- **`MediaPickerField` (`src/components/admin/media/media-picker-field.tsx`):**
  - Cho phép giá trị bắt đầu bằng `/`, `http://` hoặc `https://` hợp lệ (`new URL(...)`).
  - Thumbnail `<Image>` bật `unoptimized` cho URL ngoài bắt đầu bằng `http` để URL R2/custom CDN hoặc URL dán tay không bị `next/image` ném lỗi hostname chưa cấu hình.
- **`MediaBrowserDialog` (`src/components/admin/media/media-browser-dialog.tsx`):**
  - Giữ props tương thích (`kind`, `open`, `onOpenChange`, `value`, `onSelect`).
  - Thêm 2 tab rõ ràng (mặc định mở **Kho R2 (Cloud)** khi có thể, hoặc chuyển mượt sang **Tài nguyên sẵn**):
    - **Kho R2 (Cloud):** hiển thị thanh Upload file (`png/jpg/webp` ≤ 2MB với `kind='image'`, `mp3/ogg/wav/m4a/webm` ≤ 20MB với `kind='audio'`), nút xóa asset kèm xác nhận, phân trang "Tải thêm" theo `nextCursor`, và banner trạng thái tiếng Việt khi `configured === false` (dev thiếu khóa R2).
    - **Tài nguyên sẵn (`clone-assets`):** giữ luồng duyệt `/api/admin/media` như hiện tại.

### 3.3. Quản lý Đề thi (`/admin/exam`, `/admin/exam/[id]`) & Phần `write` / `speak`
- **Kiểu & Schema (`src/types/exam.ts`, `src/schemas/exam.ts`, `src/lib/exam-blank.ts`, `src/lib/admin-validate.ts`):**
  - Mở rộng `PartKind`: `'dragdrop' | 'matching' | 'multichoice' | 'gapfill' | 'write' | 'speak'`.
  - Bổ sung trên `Exam`: `isDemo?: boolean`, `order?: number`.
  - Bổ sung trên `ExamPart`: `maxScore?: number`, `prompt?: WritingPrompt | null` (với `write`), `speakKind?: SpeakingQuestionKind | null`, `speakQuestions?: SpeakingQuestion[]` (với `speak`). Giữ `questions: ExamQuestion[]` (có thể rỗng `[]` với `write`/`speak`).
  - Mở rộng `validateExam()` kiểm tra hợp lệ riêng cho `write` (yêu cầu `prompt.title` hoặc `prompt.instruction`, `maxScore > 0`) và `speak` (`speakKind`, ít nhất 1 câu trong `speakQuestions`, `maxScore > 0`).
- **Danh sách đề (`src/components/admin/exam/exam-list-table.tsx`):**
  - Dữ liệu từ `useAdminExams()` (`GET /api/exams`).
  - Tìm kiếm theo tên/ID/cấp độ + lọc nhanh theo hành tinh.
  - Cột Trạng thái / Thứ tự + nút bật/tắt `Demo` (`PATCH /api/exams/:id/demo`), nhân bản (`POST /api/exams` tạo bản mới với UUID mới từ server), xóa (`DELETE /api/exams/:id`), Nhập/Xuất JSON.
  - Nếu phát hiện `localStorage` (`ela.exams.v1`) còn đề cũ chưa có trên server → hiện banner **"Đồng bộ N đề từ trình duyệt lên máy chủ"** để import một chạm (bỏ ID `exam_...` cũ khi `POST`), và sau khi đồng bộ thành công xóa hoặc đánh dấu rõ tránh trùng.
- **Trình soạn đề (`src/components/admin/exam/editor/exam-editor.tsx` & `part-card.tsx`):**
  - Hỗ trợ `examId === 'new'` (tạo bằng `POST /api/exams` **không gửi `id` tạm `exam_...`**, lưu xong điều hướng sang `/admin/exam` hoặc `/admin/exam/${saved.id}`) và edit `GET /api/exams/:id` → `PUT /api/exams/:id`.
  - Metadata "Thông tin chung": dropdown **Hành tinh** lấy từ `GET /api/planets` (tự điền `levelSlug` + `levelName`, giữ nguyên được giá trị cũ nếu slug không khớp hành tinh nào), input **Thứ tự (`order`)**, checkbox **Đề dùng thử (Demo)**.
  - Bổ sung `PartFormWrite` (tiêu đề, hướng dẫn, 3 ảnh minh họa `WritingStoryImage` gắn `MediaPickerField`, đáp án mẫu, điểm tối đa `maxScore`) và `PartFormSpeak` (chọn `speakKind` trong 6 loại, `maxScore`, danh sách `speakQuestions` form cơ bản `id`/`text`/`vi`/`sceneBg`/`zoomCard` + `QuestionsJsonEditor` tùy biến JSON `speakQuestions` cho `scene`/`palette`/`cards` có tọa độ).
  - Thêm `PartWrite` & `PartSpeak` trong `src/components/exam/parts/` để `PartPreview` hiển thị xem trước trực tiếp; cập nhật `gradeExam` trong `src/lib/exam-grade.ts` bỏ qua tự luận `write`/`speak`.

### 3.4. Kho câu hỏi (`/admin/questions`), Lối vào Admin & Tổng quan CMS
- **Kho câu hỏi (`/admin/questions`):**
  - Thêm route `ROUTES.ADMIN_QUESTIONS = '/admin/questions'` và mục **Kho câu hỏi** trong `ADMIN_NAV`.
  - Trang quản trị CRUD đầy đủ với `GET/POST/PUT/DELETE /api/questions`: lọc `levelSlug`, `skill`, `kind`, tìm kiếm `q`, phân trang, modal/drawer tạo & sửa câu hỏi (form nhanh hoặc JSON cho `question` + tag kỹ năng + loại + hành tinh).
  - Trong `PartCard` của `ExamEditor`: thêm nút **"Chèn từ kho"** mở dialog `QuestionBankPickerDialog` lọc sẵn theo `part.kind` tương ứng (với `write` → `writing_prompt`, `speak` → `speakKind`/skill `speaking`, 4 dạng khách quan → đúng `kind`) và tạo `id` mới khi chèn vào đề.
- **Lối vào Admin (`Topbar` & `MobileNavDrawer`):**
  - Trong menu user của [topbar.tsx](file:///D:/luyenthiao/luyenthiao.com-Web/src/components/common/topbar.tsx) và card tài khoản của [mobile-nav-drawer.tsx](file:///D:/luyenthiao/luyenthiao.com-Web/src/components/common/mobile-nav-drawer.tsx): khi `user.role === 'ADMIN'`, hiển thị mục **"Quản trị CMS"** dẫn tới `/admin`.
- **Tổng quan CMS (`AdminOverview`):**
  - Lấy số liệu Đề thi & Kho câu hỏi từ API thật (`useAdminExams`, `useAdminQuestions`) và cập nhật CMS Module Readiness Map phản ánh Đề thi, Kho câu hỏi, Media R2 đã kết nối API.

---

## 4. Nguyên tắc Kiểm thử & Bảo toàn Ràng buộc

- Mọi component mới dưới `src/components/admin/**` phải giữ Light CMS Theme và pass `admin-light-theme.test.ts` + `no-raw-html.test.ts`.
- Không bật `whitelist: true` ở Backend `main.ts`.
- Backend verify: `npx tsc --noEmit`, `npm run lint` (không thêm warning ngoài baseline), `npm test`, và test HTTP thực tế bằng token ADMIN/USER/unauthenticated trên cổng `3005`.
- Web verify: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, và kiểm tra trực tiếp trên trình duyệt đối với `/admin`, `/admin/exam`, `/admin/exam/new`, `/admin/questions`, và menu user trên `/`.
