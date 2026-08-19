# Section Spec — checkpoint: Test Intro / Choose Mode Modal

- **Route(s):** `/check-point/[id]` (e.g. `/check-point/7778495e-531b-4039-a3ea-321874ba1a7a`)
- **Screenshots:** `_webclone/captures/check-point/desktop.png`
- **Chunk owns:** `src/app/check-point/[id]/page.tsx`, `src/components/checkpoint/mode-select-modal.tsx`

## Layout intent

```
Page (fixed full-screen bg bg-checkpoint-page.d7e3979b.jpg, scale-0.9 container)
├─ Background image (fixed top-0 left-0 w-full h-full object-cover)
└─ Modal (relative, w-[721px] h-[688px], p-[70px], radial-gradient orange→dark red)
   ├─ Border frame (border.c71a6ea1.png, 4 corners/edges)
   ├─ Close button (close.6f7d2509.png, top-right)
   ├─ Title block (text-center, text-shadow)
   │  ├─ "Thử thách 1" (20px white)
   │  └─ "Chọn chế độ" (46px white)
   ├─ Decor: icon-bottom-left (w-210px), icon-bottom-right (w-320px), rocket
   ├─ Mode Tabs (w-[439px] h-[60px] rounded-[10px], bg rgb(131,20,5))
   │  ├─ Tab active: bg rgb(205,93,77), white text — "Thi thử"
   │  └─ Tab inactive: transparent, muted text — "Luyện tập"
   ├─ Detail Card (w-[578px] h-[430px] rounded-[40px], bg rgb(167,53,38), border rgb(131,20,5))
   │  ├─ "Chi tiết" (yellow rgb(255,244,130))
   │  ├─ "Bài kiểm tra có: 2 Phần - Tổng thời gian: 65 Phút"
   │  └─ Per part (inner bg rgb(131,20,5)):
   │     ├─ "Listening" + "· Điểm tối đa" + "25 Điểm / 35 Phút"
   │     └─ "Reading - Writing" + "· Điểm tối đa" + "35 Điểm / 30 Phút"
   └─ Start Button (3D gradient, rocket icon, corner SVG decoration, "Bắt đầu")
```

## Colors (SOURCE from HTML inline styles)

| Token | Value | Use |
|---|---|---|
| modal-bg-start | rgba(255,99,0,0.8) | radial-gradient top |
| modal-bg-end | rgba(150,18,0,0.8) | radial-gradient bottom |
| tab-track | rgb(131,20,5) | tab container + inner card |
| tab-active | rgb(205,93,77) | selected tab |
| card-bg | rgb(167,53,38) | detail card |
| accent-yellow | rgb(255,244,130) | headings |

## State

- `mode`: "exam" | "practice" (Thi thử / Luyện tập)
- Start button: navigates to exam screen (mock alert or next phase)

## Mock data

- `_webclone/design-model/mocks/checkpoints.json`: parts [{name, maxScore, minutes}]

## Acceptance criteria

- [ ] Modal matches layout with real assets
- [ ] Tabs switch active state
- [ ] Start button present with rocket icon
- [ ] Responsive scale
