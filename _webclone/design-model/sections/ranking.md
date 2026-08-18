# Section Spec — ranking: Ranking Page

- **Route(s):** `/ranking`
- **Screenshots:** `_webclone/captures/ranking/desktop.png`
- **Chunk owns:** `src/app/(dashboard)/ranking/page.tsx`, `src/components/ranking/ranking-table.tsx`

## Layout intent

```
Page Container (flex col, max-w-7xl mx-auto, p-4 md:p-8)
├─ Header Section
│  ├─ Title: "BẢNG XẾP HẠNG"
│  └─ Filters (Row of selects/inputs: Mã lớp, Cấp độ, Tỉnh/TP, Trường)
├─ Tabs Section
│  ├─ Time Tabs (NGÀY, TUẦN, THÁNG, NĂM) - Custom pill buttons
│  └─ Entity Tabs (Xếp hạng Học sinh, Xếp hạng Trường học) - Text buttons with active underline
├─ Table Section (bg-white/10 rounded-3xl p-4 md:p-6 backdrop-blur-sm border border-white/10)
│  └─ Table (w-full)
│     ├─ Thead (HẠNG, HỌC SINH, TỈNH/THÀNH PHỐ, TRƯỜNG, ĐIỂM)
│     └─ Tbody
│        ├─ Top 3 rows (Custom styling: gold/silver/bronze badges, larger avatars)
│        └─ Regular rows (Standard styling)
└─ Footer Text: "Bảng Xếp Hạng “nhà Du Hành” Xuất Sắc Của Cuộc Thi Phá Đảo Cùng Flyer"
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Filters | HTML `select` / `input` | Styled with Tailwind |
| Tabs | `GameButton` | Custom variants for tabs |
| Table | HTML `table` | Responsive wrapping container |

## State, validation, interactions

- **Client UI state:** Active Time Tab, Active Entity Tab.
- **Server Data (Mock):** List of ranked users.

## Animation

- **Hover:** Rows highlight on hover.
- **Top 3:** Glowing effects for top 3 positions.

## Mock data

- Create a small list of 10-15 students matching the text capture.

## Acceptance criteria

- [ ] Page renders within the Dashboard Layout.
- [ ] Tabs are clickable (visually).
- [ ] Table displays Top 3 differently from the rest.
