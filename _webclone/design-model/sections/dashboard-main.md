# Section Spec — dashboard-main: Main Dashboard and Layout Shell

- **Route(s):** `/`
- **Screenshots:** `_webclone/captures/dashboard/desktop.png`
- **Chunk owns:** `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/page.tsx`, `src/components/dashboard/planet-card.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/topbar.tsx`

## Layout intent

```
App Shell (flex row, h-screen, overflow-hidden, bg-brand-background)
├─ Sidebar (w-[80px] lg:w-[250px], flex col, fixed left)
│  ├─ User Avatar + Name
│  ├─ Navigation Links (Xếp hạng, Lịch sử, Nhiệm vụ, ...)
│  └─ Footer Links (Thầy cô/Phụ huynh, Kích hoạt)
└─ Main Content (flex-1, ml-[80px] lg:ml-[250px], flex col)
   ├─ Topbar (h-[80px], flex row justify-end items-center, gap-4)
   │  ├─ Currencies (Coin, Diamond)
   │  └─ Profile Dropdown / Auth Buttons
   └─ Page Content (flex-1, overflow-y-auto, p-8)
      ├─ Filter Tabs (Tất cả, Cấp độ, Kiểm tra trình độ)
      └─ Planet Grid (grid 1-col mobile, 2-col tablet, 3-col desktop, 4-col lg)
         └─ PlanetCard × N (flex col items-center, transparent bg, floating planet img)
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Sidebar | `@/components/ui/sheet` (mobile) | Custom sidebar layout |
| Planet Grid | `@/components/ui/card` | Highly customized floating transparent card |
| Buttons/Tabs | `@/components/ui/button` | Existing GameButton |

## State, validation, interactions

- **Client UI state (Zustand or local):** Mobile sidebar open/close state. Filter tab selection (Tất cả / Cấp độ...).
- **Server Data (Mock):** List of planets (id, name, description, image, required level, etc.).
- **Interactions:**
  - Hover on PlanetCard: Floats up (translate-y) and glows.
  - Hover on Sidebar links: text color / background highlight.

## Animation

| Interaction | Effect type (matrix term) | Tech (from matrix) | Budget request |
|---|---|---|---|
| Planet Hover | micro-interaction | CSS hover + transition | — |
| Ambient floating | ambient | CSS keyframes (up/down) | — |

## Mock data

- `src/types/planet.ts`: `Planet` interface.
- `_webclone/design-model/mocks/planets.json`: 10+ planets data.

## Evidence grading

| Detail | Grade | Basis |
|---|---|---|
| Sidebar items | SOURCE | Extracted from text (Xếp hạng, Lịch sử, ...) |
| Planet list | SOURCE | Extracted from text (IOE, STARTERS, MOVERS, ...) |

## Acceptance criteria

- [ ] Shell renders correctly with responsive sidebar
- [ ] Topbar displays currencies
- [ ] Planet grid is responsive (1 to 4 cols)
- [ ] CSS animations (floating) work
