# Design Specification: Seven Wonders Planet Update (Candy, Coral, Time)

- **Date:** 2026-11-23
- **Status:** Proposed
- **Target Component:** Homepage / Dashboard 3D Coverflow Carousel (`DashboardView`, `PlanetDiorama`, `planet.ts`)

---

## 1. Context & Motivation

The homepage features the **"7 Thế Giới Diệu Kỳ"** (7 Magical Worlds) in a 3D Coverflow Swiper carousel. Previously:
- 4 academic exam worlds existed: STARTERS (Đấu Trường Cổ Tích), MOVERS (Vương Quốc Sóng Xanh), FLYERS (Khu Vườn Thần Tiên), TOEFL PRIMARY (Miền Đất Tương Lai).
- The remaining 3 fantasy/adventure worlds were not yet integrated into the active carousel.
- The user provided 3 ChatGPT-generated high-fidelity 3D miniature island designs:
  1. `https://chatgpt.com/s/m_6b0318b613348191837199f75f1dfb65`: "Floating Candy Castle Planet" -> Replace "Hòn đảo kẹo ngọt" (Candy Wonderland / Xứ Sở Ngọt Ngào).
  2. `https://chatgpt.com/s/m_6b0318f8653c819189a23fadcf47124e`: "Whimsical Coral Kingdom Diorama" -> Add "Xứ sở san hô" (Coral Kingdom / Coral Wonderland).
  3. `https://chatgpt.com/s/m_6b03194b7d248191805bdc70641b50d9`: "Whimsical Steampunk Time Kingdom" -> Add "Ốc đảo thời gian" (Time Oasis).

---

## 2. Architecture & Data Model

### 2.1 The 7 Worlds System
| # | Slug | Name (Arched 3D Title) | Subtitle (Em-Dash) | Level / Status | Asset Path | Glow / Ribbon Colors |
|---|------|------------------------|--------------------|----------------|------------|-----------------------|
| 1 | `starters` | STARTERS | Đấu Trường Cổ Tích | Pre A1 | `/clone-assets/media/planet_ioe.png` | `#ec4899` / `#f472b6` -> `#f43f5e` |
| 2 | `movers` | MOVERS | Vương Quốc Sóng Xanh | A1 | `/clone-assets/media/planet_movers.png` | `#06b6d4` / `#0284c7` -> `#0369a1` |
| 3 | `flyers` | FLYERS | Khu Vườn Thần Tiên | A2 | `/clone-assets/media/planet_flyers.png` | `#8b5cf6` / `#84029b` -> `#a54a8e` |
| 4 | `toefl_primary` | TOEFL PRIMARY | Miền Đất Tương Lai | A2 & B1 | `/clone-assets/media/planet_toefl_primary.png` | `#f59e0b` / `#d97706` -> `#b45309` |
| 5 | `candy` | KẸO NGỌT | Xứ Sở Ngọt Ngào | Sắp ra mắt (Coming Soon) | `/assets/planets/planet_candy_wonderland.png` | `#ec4899` / `#f472b6` -> `#fb7185` |
| 6 | `coral` | SAN HÔ | Xứ Sở San Hô | Sắp ra mắt (Coming Soon) | `/assets/planets/planet_coral_wonderland.png` | `#06b6d4` / `#22d3ee` -> `#0ea5e9` |
| 7 | `time` | THỜI GIAN | Ốc Đảo Thời Gian | Sắp ra mắt (Coming Soon) | `/assets/planets/planet_time_oasis.png` | `#eab308` / `#f59e0b` -> `#d97706` |

### 2.2 Data Resilience (Server Component & Fallback)
- In `src/schemas/planet.ts`:
  Define `ADVENTURE_WORLDS`: default rows for `candy`, `coral`, and `time` with `comingSoon: true`, `linkUrl: '/challenges/<slug>'`.
  In `toPlanets(rows)`: If `rows` from the backend does not contain these adventure worlds, merge them in (sorted by `sortOrder`), guaranteeing all 7 worlds appear seamlessly in development, CI, production SSR, and when backend only provides exam levels.
- Update `PLANET_OVERRIDES` to ensure full image and description lock.
- Support both `time` and `time_oasis` slugs.

---

## 3. Visual & UI Specs

1. **Assets:**
   - 3 transparent 1254×1254 RGBA WebP/PNG assets in `src/public/assets/planets/`:
     * `planet_candy_wonderland.png`
     * `planet_coral_wonderland.png`
     * `planet_time_oasis.png`
   - Bounding boxes trimmed and centered with ~40px transparent margin to prevent clipping during 3D coverflow tilting.
2. **Typography & Badges:**
   - Display arched name: `KẸO NGỌT`, `SAN HÔ`, `THỜI GIAN`.
   - Subtitle: `— Xứ Sở Ngọt Ngào —`, `— Xứ Sở San Hô —`, `— Ốc Đảo Thời Gian —`.
   - Badge: Lavender-gold frosted capsule `✨ SẮP RA MẮT` for adventure worlds.
3. **Coverflow Swiper Interaction:**
   - Responsive scaling: Active centered planet at scale 1.25x - 1.36x, inactive side planets at 0.78x.
   - Smooth navigation through all 7 worlds.

---

## 4. Verification Plan

1. `npx tsc --noEmit` (0 errors).
2. `npm test` (all unit test suites pass, updated fixture & schema tests).
3. Visual validation: Automated Playwright script capturing Desktop (1920×1080) and Laptop (1366×768) swiping through all 7 worlds.
