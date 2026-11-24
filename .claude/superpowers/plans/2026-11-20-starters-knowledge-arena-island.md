# Plan: Starters knowledge-arena island + drop IOE planet

Spec: `.claude/superpowers/specs/2026-11-20-starters-knowledge-arena-island-design.md`
Repo: `D:\Zira\luyenthiao\web` (run npm from `src/`). Do not commit. Do not touch `public/clone-assets/`.

## Task 1 (single task)
Files: `src/schemas/planet.ts` (`toPlanets`, line ~29), `src/schemas/planet.test.ts`,
`src/components/dashboard/dashboard-view.test.tsx` (test at line 42 "marks the IOE planet as coming soon").
Fixture input: `src/schemas/__fixtures__/planets.json` (do not edit).

1. In `toPlanets`, skip rows with `slug === 'ioe'` (filter before sort/map).
2. Add a slug-keyed override constant (SCREAMING_SNAKE_CASE) in `planet.ts`:
   `starters` -> image `/clone-assets/media/planet_ioe.png`, description `Đấu Trường Tri Thức`. Apply in the map
   (override wins over row values). Other fields (name `STARTERS`, href, colors) untouched.
3. Update `planet.test.ts`: starters gets the new image/description and name still `STARTERS`; ioe is absent from the result;
   the old "ioe href /challenges, comingSoon" assertion is replaced.
4. Update `dashboard-view.test.tsx` so it no longer expects an IOE planet (if it relies on `comingSoon`, use another way to
   cover the comingSoon branch or drop that test with a note). Starters test (line 39, push `/testlevels/starters`) must stay.
5. Verify from `src/`: `npx prettier --write` on changed files, `npx tsc --noEmit`, `npm test`, `npm run lint` (no new errors
   vs baseline in `docs/03-known-issues.md`).

Return: status, changed files, command results. If the dashboard test cannot be adapted without a decision, return NEEDS_CONTEXT.
