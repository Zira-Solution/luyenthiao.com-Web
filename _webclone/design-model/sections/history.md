# Section Spec — history: History Page

- **Route(s):** `/history`
- **Screenshots:** `_webclone/captures/history/desktop.png`
- **Chunk owns:** `src/app/(dashboard)/history/page.tsx`

## Layout intent

```
Page Container (flex col, max-w-7xl mx-auto, p-4 md:p-8, pb-28)
├─ Navigation & Actions Header
│  ├─ Back Button ("Quay lại") - Custom blue 3D button or icon link
│  └─ Shield Redemption Button ("Quy đổi khiên") - Custom yellow/orange 3D button
├─ Page Title: "LỊCH SỬ LÀM BÀI" (Vibrant text shadow)
├─ Filters Section (bg-[#0a1a3a]/80 backdrop-blur border-3 border-[#1e3a8a] rounded-3xl p-6 mb-8)
│  └─ Filters Row (Grid: Cấp độ, Kĩ năng, Tên bài kiểm tra, Trạng thái)
├─ Table Container (bg-[#0a1a3a]/60 backdrop-blur rounded-[2rem] border-3 border-[#1e3a8a] p-4 md:p-6 overflow-x-auto)
│  ├─ Table (w-full)
│  │  ├─ Thead (THỜI GIAN NỘP BÀI, CẤP ĐỘ, KĨ NĂNG, ĐỀ THI, ĐIỂM SỐ, SỐ CÂU ĐÚNG / TỔNG, TRẠNG THÁI)
│  │  └─ Tbody (Empty State by default: "HIỆN TẠI CHƯA CÓ LỊCH SỬ BÀI LÀM. CHĂM CHỈ LÀM BÀI HƠN BẠN NHÉ!")
│  └─ Mock Data Rows (Toggleable / populated when query is set)
└─ Footer Info Box (bg-[#1e1f66]/50 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 text-white/80)
   └─ Parent/Teacher QR Code: "Quét mã QR tải App dành riêng cho Giáo viên / Phụ huynh"
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Back Button | `Link` or custom routing clicker | Back arrow + "Quay lại" |
| Redemption Button | `GameButton` (CTA/Yellow variant) | Shield emoji + "Quy đổi khiên" |
| Filters | HTML `select` / `input` | Styled with Tailwind and game-aesthetic dropdown styling |
| Table | HTML `table` | Responsive with backdrop-blur support |
| QR Info | Tailwind Box + flex layout | QR image mock + text |

## State, validation, interactions

- **Client UI state:** Active filters (Level, Skill, Search, Status).
- **Server Data (Mock):** List of history attempts (empty state display when no matches or default state).
- **Interactive features:** Back navigation, external link for QR Code.

## Mock data

- Create a small list of student attempt history logs containing level, skills (Reading, Listening, Writing, Speaking), exam name, score, correct ratio, submission time, and status.

## Acceptance criteria

- [ ] Page renders within the Dashboard Layout.
- [ ] Filters can be selected/updated.
- [ ] Displays beautiful empty state matching the text description.
- [ ] Connects correctly with the navigation headers.
