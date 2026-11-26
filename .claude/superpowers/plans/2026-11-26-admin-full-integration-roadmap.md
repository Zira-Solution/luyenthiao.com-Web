# Lộ trình Tích hợp & Hoàn thiện Toàn diện Hệ thống Admin (`luyenthiao.com`)

**Ngày lập:** 2026-11-26  
**Phạm vi:** Hai repository `luyenthiao.com-Backend` (NestJS 12 + Prisma 6 + MySQL + Redis + R2 S3) và `luyenthiao.com-Web` (Next.js App Router + TanStack Query + Zod + Tailwind v4).  
**Trạng thái hiện tại:** Khung giao diện CMS Light Theme (`/admin`, `/admin/exam`, `/admin/exam/[id]`, `MediaBrowserDialog`, `MediaPickerField`) đã hoàn thiện phần shell & UI nền; dữ liệu Đề thi hiện vẫn chạy trên `localStorage` và chưa nối với các module API đã có ở Backend.

---

## 1. Bức tranh Tổng thể Hiện trạng Backend vs Web

| Phân hệ | Trạng thái Backend (`luyenthiao.com-Backend`) | Trạng thái Web (`luyenthiao.com-Web`) | Phần cần làm |
| :--- | :--- | :--- | :--- |
| **Shell, Theme & Điều hướng** | `AdminGuard` kiểm tra `user.role === 'ADMIN'` | Shell Light Theme + `/admin` overview đã xong; `RequireAdmin` chỉ chặn tầng UX | Mở rộng `ADMIN_NAV`, `ROUTES`; thêm lối vào `/admin` cho Admin trên giao diện học viên |
| **Upload & Kho Media R2** | Có `POST /api/uploads` (ảnh ≤ 2MB, audio ≤ 20MB → trả URL R2 công khai) | `MediaBrowserDialog` mới duyệt ảnh tĩnh qua `/api/admin/media`; `MediaPickerField` chặn URL không bắt đầu bằng `/` | BE thêm `GET /api/uploads` + `DELETE /api/uploads`; Web mở `images.remotePatterns`, hỗ trợ URL `https://` R2 và upload trực tiếp lên R2 |
| **Đề thi (`exams`)** | Có CRUD + `indexQuestions` (hỗ trợ cả `write`, `speak` & 4 dạng khách quan); `create` hardcode `isDemo: false`; `SaveExamDto` thiếu `isDemo`, `order` | `/admin/exam` & `/admin/exam/[id]` đang lưu `localStorage` (Zustand); ID dạng `exam_...`; thiếu part `write` & `speak` | BE thêm `isDemo`/`order` + `PATCH /exams/:id/demo` + phân trang tùy chọn; Web nối `/api/exams` (bỏ `id` khi tạo để Prisma cấp UUID), thêm form `write`/`speak` |
| **Kho câu hỏi (`questions`)** | Đầy đủ `GET/POST/PUT/DELETE /questions` (lọc `level`, `skill`, `kind`); chưa phân trang server | Chưa có UI | BE thêm phân trang tùy chọn; Web xây `/admin/questions` + chèn câu từ kho vào Editor đề thi |
| **Chấm Speaking (`speaking-submissions`)** | Đầy đủ `GET /queue`, `GET /:id`, `PUT /:id/grade` (`manualScore`, `feedback`), tự gọi `recomputeTotal()` | Chưa có UI | BE thêm lọc `?status=PENDING\|GRADED` + phân trang queue; Web xây giao diện nghe audio & chấm điểm |
| **Chấm Writing (`writing-submissions`)** | Đầy đủ `GET /queue`, `GET /:id`, `PUT /:id/grade` (`score`, `feedback: { comment, errors, tips }`), tự `recomputeTotal()` | Chưa có UI | BE thêm lọc `?status=PENDING\|GRADED` + phân trang queue; Web xây trình xem bài viết & form rubric JSON |
| **Hành tinh (`planets`)** | Đầy đủ CRUD + `POST /planets/reorder` (chặn xóa HTTP 409 nếu có đề dùng `slug`) | Học viên còn `PLANET_OVERRIDES` hardcode ảnh/tên; chưa có UI Admin | Web xây `/admin/planets` + kéo/đẩy thứ tự + chọn ảnh R2; tháo xung đột `PLANET_OVERRIDES` |
| **Cấu hình Trang chủ (`site-config`)** | Đầy đủ `GET /site-config/public` & `PUT /site-config` (11 section khớp `DEFAULT_SITE_CONFIG`) | Đang đọc config mặc định / public; chưa có UI Admin | Web xây `/admin/site-config` theo 11 tab + gắn `MediaPickerField` R2 |
| **Từ vựng (`vocab`)** | Đầy đủ CRUD `VocabWord`; `getAllAdmin()` chưa phân trang server | Chưa có UI | BE thêm phân trang/tìm kiếm; Web xây `/admin/vocab` + bộ lọc + audio R2 |
| **Nhiệm vụ (`tasks`)** | Đầy đủ CRUD `Task` (`DAILY\|WEEKLY\|ACHIEVEMENT`, `actionType`, `points`, `sortOrder`) | Chưa có UI | Web xây `/admin/tasks` |
| **Trường học (`schools`)** | Đầy đủ CRUD `School` (chặn xóa nếu `_count.users > 0`) | Chưa có UI | Web xây `/admin/schools` + hiển thị số học viên |
| **Thông báo (`notifications`)** | Đầy đủ `GET/POST/DELETE`, `users/search?q=` (gửi toàn hệ thống hoặc từng user); chưa phân trang | Chưa có UI | BE thêm phân trang tùy chọn; Web xây `/admin/notifications` |
| **Người dùng (`User`)** | **Chưa có** module/API quản trị User | Chưa có UI | **Xây mới BE + Web:** CRUD/quản trị danh sách, đổi role, gán trường, khóa/mở tài khoản + thu hồi JWT |
| **Dashboard Stats Thật** | **Chưa có** endpoint `/admin/stats` | `/admin` đang hiện số đếm từ `localStorage` | **Xây mới BE + Web:** `GET /admin/stats` tổng hợp số liệu thật thay thế placeholder |
| **Giám sát Bài làm, Đấu trường, Điểm** | **Chưa có** endpoint admin cho `ExamAttempt`, `ChallengeRoom`/`ChallengeResult`, `PointLog` | Chưa có UI | **Xây mới BE + Web:** màn hình tra cứu bài làm học viên, phòng đấu trường & log điểm |

---

## 2. Nguyên tắc Kỹ thuật Xuyên suốt (Bắt buộc Tuân thủ)

1. **Tách biệt Chuỗi Quy trình Superpowers cho Từng Giai đoạn:** Mỗi Giai đoạn (Sub-project) bên dưới sẽ đi riêng một vòng `brainstorming (spec) → writing-plans (plan) → TDD → verify TypeScript/ESLint/Vitest → verify trực tiếp trên trình duyệt`.
2. **Bảo toàn Ràng buộc Backend Hiện hành:**
   - Không bật `whitelist: true` trên global `ValidationPipe` (tránh cắt mất dữ liệu lồng trong `structures` của `Exam`).
   - Giữ `DELETE /api/exams/:id` trả HTTP 200 JSON; mọi lỗi nghiệp vụ giữ cấu trúc `{ message, error, statusCode }` tiếng Việt.
   - Đảm bảo khóa tài khoản / hạ quyền `User` cập nhật `authIatFloor` để vô hiệu hóa access/refresh token hiện hành.
3. **Quy chuẩn Tích hợp API trên Web:**
   - Tạo lớp API/schema/hook tách riêng theo pattern `authFetch<unknown>(...)` + `parseOrThrow(zodSchema, data, endpoint)` tại `src/lib/api/admin/*` và `src/hooks/admin/*`.
   - Tách riêng namespace TanStack Query cho admin (ví dụ `['admin', ...]` trong `src/lib/query-keys.ts`) để không lẫn với nhánh `['me', ...]` của `PrivateDataCleanup`.
   - Khi tạo đề thi mới qua `POST /api/exams`, **không gửi `id` giả dạng `exam_...`** từ client (do `SaveExamDto.id` gắn `@IsUUID()`), để Backend tự sinh UUID.
   - Tuân thủ nghiêm `lib/no-raw-html.test.ts` (không chèn HTML thô) và `components/admin/admin-light-theme.test.ts` (không dùng class dark theme trong `src/components/admin/**`).

---

## 3. Lộ trình 5 Giai đoạn Chi tiết

### Giai đoạn 1 — Nền tảng API Admin, Media R2 & Tích hợp Đề thi + Kho câu hỏi (Ưu tiên #1)

**Mục tiêu:** Thay thế hoàn toàn dữ liệu `localStorage` ở phần Đề thi bằng API thật, mở khóa upload/quản lý R2 làm nền tảng cho mọi trang sau, và hoàn thiện đầy đủ 6 dạng phần thi (gồm cả `write` và `speak`).

- **Backend (`luyenthiao.com-Backend`):**
  1. Cập nhật `SaveExamDto` bổ sung `isDemo?: boolean`, `order?: number`; sửa `ExamsService.create` để nhận các trường này thay vì hardcode `isDemo: false`; thêm `PATCH /exams/:id/demo`.
  2. Mở rộng `UploadsController`: thêm `GET /api/uploads` (liệt kê object theo prefix/phân trang R2) và `DELETE /api/uploads` (xóa file không còn dùng).
  3. Hỗ trợ phân trang/tìm kiếm tùy chọn (opt-in qua query param để giữ tương thích ngược với frontend học viên) cho `exams.list` và `questions.list`.
- **Web (`luyenthiao.com-Web`):**
  1. Dựng hạ tầng `src/lib/api/admin/*`, schemas Zod và `queryKeys.admin` trong `src/lib/query-keys.ts`.
  2. Cấu hình `images.remotePatterns` trong `src/next.config.ts` cho domain R2; nâng cấp `MediaPickerField` (chấp nhận cả `/` nội bộ và `https://` R2 hợp lệ) + `MediaBrowserDialog` (thêm tab R2, nút upload qua `POST /api/uploads`, nút xóa object qua `DELETE /api/uploads`, hiển thị giới hạn dung lượng 2MB ảnh / 20MB audio).
  3. Chuyển `/admin/exam` & `/admin/exam/[id]` sang `/api/exams`: hỗ trợ `isDemo`, `order`, mở rộng `PartKind` & `examPartSchema` thêm `'write'` (`prompt`, `maxScore`) và `'speak'` (`speakKind`, `speakQuestions`, `maxScore`), giữ tùy chọn Export/Import JSON an toàn.
  4. Xây mới `/admin/questions` (Kho câu hỏi): CRUD đầy đủ với `SaveQuestionDto`, lọc theo `level`, `skill`, `kind`, và nút chèn nhanh câu hỏi từ kho vào phần thi trong Exam Editor.
  5. Thêm lối vào `/admin` trên giao diện điều hướng khu học viên chỉ hiển thị khi `user.role === 'ADMIN'`.

---

### Giai đoạn 2 — Hàng đợi Chấm bài Speaking & Writing (`/admin/grading`)

**Mục tiêu:** Đưa vào vận hành quy trình giáo viên/admin chấm các phần thi tự luận mà Backend đã xử lý xong logic tính tổng điểm.

- **Backend:** Bổ sung query param `?status=PENDING|GRADED` và phân trang cho `GET /speaking-submissions/queue` & `GET /writing-submissions/queue`.
- **Web:**
  1. Thêm mục **Chấm bài** vào `ADMIN_NAV` (kèm badge đếm bài `PENDING` khi có API hỗ trợ).
  2. Tab/Trang **Speaking**: trình phát audio bài thu của học viên, đề bài + `maxScore`, form chấm `manualScore` (validate `0..part.maxScore`) và `feedback` văn bản.
  3. Tab/Trang **Writing**: hiển thị bài làm của học viên, đếm từ, đề bài + `maxScore`, form chấm `score` (validate `0..part.maxScore`) và `feedback` có cấu trúc `{ comment, errors, tips }`; xác nhận tổng điểm `ExamAttempt` cập nhật tức thì qua `recomputeTotal()`.

---

### Giai đoạn 3 — Quản trị Thế giới (Hành tinh) & Cấu hình Trang chủ (`/admin/planets`, `/admin/site-config`)

**Mục tiêu:** Admin chủ động điều chỉnh danh sách Hành tinh học tập và toàn bộ hình ảnh/nội dung chữ trên Trang chủ mà không phải sửa code.

- **Backend:** Đã hoàn chỉnh (`planets` CRUD + `reorder` + lỗi 409 khi còn đề thi tham chiếu; `site-config` PUT 11 section). Kiểm tra lại tính nhất quán schema trả về public vs admin.
- **Web:**
  1. Xây trang `/admin/planets`: thêm/sửa hành tinh (khóa trường `slug` ở chế độ sửa theo đúng rule `PUT /planets/:id`), sắp xếp thứ tự bằng kéo-thả hoặc nút Lên/Xuống gọi `POST /planets/reorder`, chọn ảnh bìa/icon qua `MediaPickerField` (R2), hiển thị thông báo rõ ràng nếu gặp HTTP 409 khi xóa.
  2. Rà soát và gỡ bỏ xung đột `PLANET_OVERRIDES` trong `src/schemas/planet.ts` để giao diện học viên ưu tiên hiển thị dữ liệu động từ Admin thay vì ảnh/tên hardcode.
  3. Xây trang `/admin/site-config`: chia tab trực quan tương ứng 11 section của `DEFAULT_SITE_CONFIG`, gắn `MediaPickerField` (R2) cho các trường media/banner và hỗ trợ xem trước / đặt lại mặc định từng phần.

---

### Giai đoạn 4 — Danh mục Học tập, Gamification & Thông báo

**Mục tiêu:** Tích hợp trọn vẹn 4 module CRUD đã sẵn sàng ở Backend vào cùng một hệ thống bảng/form CMS đồng bộ.

- **Backend:** Bổ sung phân trang và tìm kiếm phía server cho `vocab.getAllAdmin()` và `notifications.getAllAdmin()`.
- **Web:**
  1. `/admin/vocab`: bảng từ vựng + lọc `level`, `topic`, `active`, phát thử âm thanh, thêm/sửa từ vựng gắn `MediaPickerField` cho `audioUrl`.
  2. `/admin/tasks`: quản lý nhiệm vụ `DAILY | WEEKLY | ACHIEVEMENT`, chọn `actionType` (`COMPLETE_EXAM`, `COMPLETE_SPEAKING`, `COMPLETE_WRITING`, `PLAY_CHALLENGE`, `WIN_CHALLENGE`, `SCORE_90`), `targetCount`, `points`, `sortOrder`, bật/tắt `active`.
  3. `/admin/schools`: CRUD danh sách trường học, hiển thị cột `_count.users` và khóa/cảnh báo xóa nếu trường đang có học viên.
  4. `/admin/notifications`: gửi thông báo toàn hệ thống (`SYSTEM | EVENT | REWARD | ANNOUNCEMENT`) hoặc tìm người nhận qua `GET /notifications/users/search?q=`, xem danh sách đã gửi & xóa thông báo.

---

### Giai đoạn 5 — Xây mới các Module Còn thiếu (Users, Dashboard Analytics Thật & Giám sát Hệ thống)

**Mục tiêu:** Lấp đầy toàn bộ khoảng trống còn thiếu ở cả Backend lẫn Web để trở thành hệ thống Admin hoàn chỉnh.

- **5A — Quản lý Người dùng (`users` module + `/admin/users`):**
  - *Backend mới:* module `users` (`AdminGuard`) với `GET /users` (phân trang, tìm kiếm tên/email, lọc `role`, `schoolId`), `GET /users/:id` (chi tiết hồ sơ + thống kê điểm/bài làm), `PATCH /users/:id` (đổi `role`, `schoolId`, trạng thái khóa `active`/`isBanned` — kèm migration Prisma và đẩy `authIatFloor` để thu hồi phiên đăng nhập khi khóa/hạ quyền).
  - *Web mới:* `/admin/users` hỗ trợ tìm kiếm, lọc vai trò/trường, đổi vai trò có bước xác nhận an toàn, khóa/mở tài khoản.
- **5B — Thống kê Tổng quan Thật (`GET /admin/stats` + `/admin`):**
  - *Backend mới:* tổng hợp từ Prisma số lượng người dùng, đề thi, lượt làm bài `ExamAttempt`, hàng đợi `PENDING` Speaking/Writing, phòng/lượt đấu trường và log hoạt động gần đây.
  - *Web nâng cấp:* kết nối `/admin` (`AdminOverview`) vào `GET /admin/stats`, cập nhật toàn bộ thẻ KPI và CMS Module Readiness Map phản ánh dữ liệu thực tế.
- **5C — Trung tâm Giám sát & Kiểm duyệt (`/admin/attempts`, `/admin/challenges`):**
  - *Backend mới:* API admin tra cứu `ExamAttempt` (bài làm học viên), theo dõi `ChallengeRoom` / `ChallengeResult` (đấu trường), và lịch sử `PointLog`.
  - *Web mới:* giao diện tra cứu kết quả thi thử của học viên & giám sát đấu trường.
