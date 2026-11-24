# Implementation Plan: Seven Wonders Planet Update (Candy, Coral, Time)

- **Goal:** Update the 7 Wonders carousel on the homepage by replacing Candy Island and adding Coral Kingdom and Time Oasis 
- **Spec:** `.claude/superpowers/specs/2026-11-23-seven-wonders-planets-update-design.md`

---

## Files to modify / create

### 1. Assets
- `src/public/assets/planets/planet_candy_wonderland.png` 
- `src/public/assets/planets/planet_coral_wonderland.png` 
- `src/public/assets/planets/planet_time_oasis.png` 

### 2. Schemas & Logic
- `src/schemas/planet.ts`:
  * Define `ADVENTURE_WORLDS` (Candy, Coral, Time Oasis) with sort orders 5, 6, 7 and `comingSoon: true`.
  * Update `PLANET_OVERRIDES` and `formatWorldSubtitle` to support `candy`, `coral`, `time`, `time_oasis`.
  * Update `toPlanets` to merge missing adventure worlds so all 7 worlds render seamlessly on the dashboard.
- `src/schemas/__fixtures__/planets.json`:
  * Update fixture with all 7 worlds.
- `src/schemas/planet.test.ts`:
  * Update tests to assert 7 worlds parsing and sorting.

### 3. Dashboard UI
- `src/components/dashboard/planet-diorama.tsx`:
  * Ensure badges and arched typography render cleanly for `KẸO NGỌT`, `SAN HÔ`, `THỜI GIAN`.

### 4. Backend Seed Sync (Reference)
- `d:/Zira/luyenthiao/backend/src/scripts/ops/seed-planets-siteconfig.ts`:
  * Add the 3 adventure planets to backend seeds for future database sync.

---

## Verification
- `npx tsc --noEmit` must pass with 0 errors.
- `npm test` must pass all test suites.
- Playwright screenshot test on `http://localhost:3000` verifying all 7 planets in Swiper.
