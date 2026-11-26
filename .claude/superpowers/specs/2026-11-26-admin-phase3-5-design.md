# Spec Web: Giai đoạn 3–5 — Hành tinh, Trang chủ, Danh mục Học tập, Users, Dashboard Thật & Giám sát

**Ngày:** 2026-11-26  
**Liên kết tài liệu Backend:** `../luyenthiao.com-Backend/.claude/superpowers/specs/2026-11-26-admin-phase3-5-backend-design.md`

---

## 1. Các Route Admin & Navigation (`ROUTES`, `ADMIN_NAV`)

Bổ sung vào `ROUTES` & `ADMIN_NAV` (cùng `/admin/grading` của Giai đoạn 2):
- **Nội dung & Đánh giá:** `/admin/exam`, `/admin/questions`, `/admin/grading` (badge `pendingGrading`), `/admin/vocab`
- **Thế giới & Giao diện:** `/admin/planets`, `/admin/site-config`
- **Cộng đồng & Học tập:** `/admin/tasks`, `/admin/schools`, `/admin/notifications`, `/admin/users`
- **Giám sát hệ thống:** `/admin/attempts`, `/admin/challenges`

---

## 2. Giai đoạn 3 — Hành tinh (`/admin/planets`) & Trang chủ (`/admin/site-config`)

1. **`/admin/planets` (`PlanetsAdminView`):**
   - Nối `GET /planets`, `POST /planets`, `PUT /planets/:id`, `POST /planets/reorder`, `DELETE /planets/:id`.
   - Sắp xếp thứ tự bằng nút Lên/Xuống (gọi `POST /planets/reorder` với mảng `ids`).
   - Dialog Tạo/Sửa hành tinh: khóa trường `slug` ở chế độ sửa (khớp `PlanetsService.update`), validate mã hex cho `glowColor`/`ribbonFrom`/`ribbonTo`, gắn `MediaPickerField` (R2 + `clone-assets`) cho `image` & `mapBackground`, bật/tắt `visible`.
   - Hiển thị thông báo lỗi 409 rõ ràng khi xóa hành tinh đang có đề thi tham chiếu.
2. **Tháo xung đột `PLANET_OVERRIDES` (`src/schemas/planet.ts`):**
   - Ưu tiên giá trị từ Backend (`row.name`, `row.image`, `row.subtitle`) khi khác rỗng; chỉ fallback sang `PLANET_OVERRIDES[row.slug]` khi trường DB rỗng để thay đổi trên `/admin/planets` phản ánh ngay ra trang chủ học viên mà không làm gãy các unit test hiện tại.
   - Cho phép hiển thị ảnh URL R2 `https://` trên `PlanetDiorama` an toàn.
3. **`/admin/site-config` (`SiteConfigView`):**
   - Nối `GET /site-config/public` & `PUT /site-config`, khởi tạo theo 11 section trong `DEFAULT_SITE_CONFIG`.
   - Chia tab trực quan theo 11 section (`mapAssets`, `mapTexts`, `languages`/`defaultLanguage`, `globalAssets`, `authAssets`, `homeAssets`, `speakingAssets`, `writingAssets`, `challengeAssets`, `checkpointAssets` + JSON tổng hợp).
   - Gắn `MediaPickerField` cho các trường media/icon/background, nút **Khôi phục mặc định section** và nút **Lưu cấu hình**.

---

## 3. Giai đoạn 4 — Từ vựng, Nhiệm vụ, Trường học & Thông báo

1. **`/admin/vocab` (`VocabAdminView`):** nối `GET/POST/PUT/DELETE /vocab` với phân trang `page/limit`, lọc `level`, `topic`, `active`, tìm kiếm `q`, nút nghe thử `audioUrl` trực tiếp trên bảng, modal Tạo/Sửa gắn `MediaPickerField (kind="audio")` cho `audioUrl`.
2. **`/admin/tasks` (`TasksAdminView`):** nối `GET/POST/PUT/DELETE /tasks`, lọc theo `category` (`DAILY | WEEKLY | ACHIEVEMENT`), hiển thị `actionType`, `targetCount`, `points`, `sortOrder`, bật/tắt `active`, modal Tạo/Sửa.
3. **`/admin/schools` (`SchoolsAdminView`):** nối `GET/POST/PUT/DELETE /schools`, hiển thị cột `_count.users`, modal Tạo/Sửa (`name`, `city`, `active`), khóa/cảnh báo nút xóa nếu `_count.users > 0` và hiển thị lỗi 409 nếu Backend từ chối.
4. **`/admin/notifications` (`NotificationsAdminView`):** nối `GET/POST/DELETE /notifications` (phân trang `page/limit`, lọc `type`, tìm `q`), hiển thị số người đã đọc (`_count.reads`), modal Gửi thông báo hỗ trợ gửi toàn hệ thống hoặc tìm kiếm người nhận qua `GET /notifications/users/search?q=`.

---

## 4. Giai đoạn 5 — Users, Dashboard Thật & Giám sát

1. **`/admin/users` (`UsersAdminView`):** nối `GET /users`, `GET /users/:id`, `PATCH /users/:id`. Tìm kiếm tên/username/email, lọc `role` / `schoolId` / `isBanned`, modal xem hồ sơ chi tiết (tổng điểm + lịch sử gần đây), đổi vai trò (có confirm dialog, chặn tự hạ quyền), gán trường học, khóa/mở tài khoản (kèm cảnh báo thu hồi phiên đăng nhập).
2. **`/admin` (`AdminOverview` nâng cấp):** nối `GET /admin/stats` (kết hợp `useAdminExams`), thay toàn bộ số KPI và CMS Module Readiness Map bằng số liệu thực tế (Người dùng, Đề thi, Bài làm `ExamAttempt`, Hàng đợi `PENDING` Speaking + Writing, Câu hỏi, Hành tinh, Đấu trường) cùng danh sách 5 bài làm mới nhất & 5 đề thi gần đây.
3. **Giám sát (`/admin/attempts`, `/admin/challenges`):**
   - `/admin/attempts` (`AttemptsAdminView`): tra cứu lịch sử làm bài học viên (`GET /admin/attempts`), lọc theo `level` & `q`, phân trang, xem điểm/tổng/số bài Writing-Speaking đính kèm.
   - `/admin/challenges` (`ChallengesAdminView`): 2 tab + bảng log điểm (`ChallengeRooms` — phòng đấu & trạng thái; `ChallengeResults` — kết quả trận đấu & người thắng; `PointLogs` — lịch sử cộng điểm với lọc `source`).
