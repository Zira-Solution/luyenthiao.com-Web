# Plan: enlarge the MOVERS ("Hành Tinh Biển Xanh") planet slightly

Owner request (2026-11-20): "phóng to hành tinh biển xanh lên 1 tí". Planet = slug `movers` (fixture subtitle "Hành Tinh Biển Xanh").
Design calls (mine, owner can adjust): +10% size, grows upward from the base so it does not touch the title.

## Task 1
File: `src/components/dashboard/planet-diorama.tsx`, the `<img src={planet.image}>` at ~line 157 (inside the "CORE PLANET BODY" div).
1. Add a slug-keyed constant above the component, e.g. `PLANET_IMAGE_SCALE: Record<string, string> = { movers: 'origin-bottom scale-110' }`
   (Tailwind classes only, no inline style, no arbitrary values). Name in SCREAMING_SNAKE_CASE.
2. Append `PLANET_IMAGE_SCALE[planet.slug]` to the img `cn(...)` classes. Other planets must render exactly as before.
3. Do not touch the owner's other uncommitted edits in this file; change only these lines. Do not touch the floating animation,
   hover transform, or the title/subtitle block. Animate only transform/opacity (scale is a transform; ok).
4. Verify from `src/`: `npx prettier --write src/components/dashboard/planet-diorama.tsx`, `npx tsc --noEmit`, `npm test`,
   `npx eslint` on the file. Do not commit.
Return DONE / NEEDS_CONTEXT / BLOCKED with the diff summary and results.
