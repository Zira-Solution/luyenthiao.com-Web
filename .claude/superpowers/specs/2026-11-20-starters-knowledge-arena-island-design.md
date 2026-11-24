# Starters planet: Knowledge Arena island (short design)

## Intent
The dashboard planet picker shows the STARTERS planet as a candy island. The owner wants it replaced by the
"Knowledge Arena" island (`/clone-assets/media/planet_ioe.png`: open book, clock tower, stone arch with trophy).
The "STARTERS" title and the "Pre A1" badge stay.

## Findings (verified)
- `PlanetDiorama` (`src/components/dashboard/planet-diorama.tsx:157`) renders `planet.image`; the title is `planet.name`,
  the subtitle is `planet.description` (= API field `subtitle`).
- `Planet` rows come from the backend `GET /planets/public` through `toPlanets` (`src/schemas/planet.ts`). The web does not
  choose the image today, so the real `starters` image and "Hanh Tinh Keo Ngot" subtitle are backend data
  (not verified against the real payload: backend not running on :3005).
- `planet_ioe.png` already exists in `src/public/clone-assets/media/` and is referenced nowhere in `src/`.

## Goals
- `starters` planet shows `planet_ioe.png`, subtitle "Dau Truong Tri Thuc" (written with Vietnamese diacritics in code).
- Title "STARTERS" and badge "Pre A1" unchanged. Other planets unchanged.

- The `ioe` planet is removed from the dashboard carousel (owner decision 2026-11-20): `toPlanets` drops `slug === 'ioe'`.

## Non-goals
- No backend/DB change, no new assets, no change under `src/public/clone-assets/`.
- IOE level labels stay (`src/lib/level-label.ts`, `history-view.tsx`, `getPlanetLevelBadges` branch) so old history/notebook data
  still renders. The IOE planet fixture row stays as input data; its tests change to assert it is filtered out.
- No image optimisation (the PNG is ~1.3 MB; flagged for the owner).

## Approaches
1. **Web-side override map in `src/schemas/planet.ts`** keyed by slug, applied in `toPlanets` (image + description). Small,
   testable, works regardless of backend data. Trade-off: a client-side data override that the backend can later supersede.
2. Change the backend/DB row. Right long-term home, but outside this repo and the owner scoped this to the web.
3. Branch on `slug` inside `PlanetDiorama`. Same effect but mixes data with presentation. Rejected.

**Pick: 1** (owner agreed to a web-side change).

## Tests
Update `src/schemas/planet.test.ts` for the `starters` row; keep `dashboard-view.test.tsx` green.
