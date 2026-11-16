# Known issues

Recorded during the phase 1 restructure (2026-11-15). The missing-mocks issue was fixed in phase 3a.

## 1. Exposed third-party session tokens in git history

Earlier commits contain `_webclone/captures_exam/json_payloads/` with a session cookie,
auth/refresh tokens and a Firebase config captured from a third-party account. The files are no
longer in the tree, but they remain in git history. Treat those credentials as exposed.

## 2. Third-party assets

Everything under `src/public/clone-assets/` was downloaded from exam.flyer.us and must be replaced
with the project's own assets before production.

## 3. Pre-existing lint errors

`npm run lint` reports 8 `import-x/order` errors in `components/testlevels/level-header.tsx`,
`components/testlevels/level-map.tsx` and `components/ui/dialog.tsx`, plus
`@next/next/no-img-element` warnings. CI marks lint `continue-on-error` until they are fixed.

## 4. Pre-existing runtime warnings

- Every page logs one 404 for a missing static resource.

Both warnings the ranking pages used to log were fixed on 2026-11-16, and their console is now clean
apart from that 404 and the backend being offline in local runs:

- *Hydration mismatch.* The score cells called `toLocaleString()` without a locale, so the Node
  renderer and the browser chose different separators (`183,350` vs `183.350`). `formatScore()` in
  `lib/utils.ts` now pins the locale to `vi-VN` — use it for any number a page renders during SSR.
- *`selected` on `<option>`.* The five placeholder options sat in uncontrolled `<select>` elements.
  They now use `defaultValue=""` on the `<select>` with a plain `disabled` option
  (`components/ranking/ranking-view.tsx`, `components/ranking/school-ranking-view.tsx`). Write new
  dropdowns the same way; the third `<select>` in `school-ranking-view.tsx` has no placeholder and
  must keep its real first value.

## 5. Unused dev dependencies

`tsx` and `playwright` are no longer used by any script in `src/` (their former users were
archived). `playwright` is still used for manual screenshot verification outside the repo.
Decide whether to keep them when the tooling is set up again.

## 6. AI guidance

`AGENTS.md`, `CLAUDE.md` and `.claude/` describe the layout as of the phase 1 restructure
(2026-11-15). Update them when the layout changes.

## 7. Screenshot baselines predate sharp 0.35.5

The Next.js 16.1.6 → 16.4.6 upgrade (2026-11-16) pulled `sharp` 0.34.5 → 0.35.5. Pages built from
`next/image` now re-encode slightly differently: `/testlevels/movers` compares as 33.8% of pixels
changed against a pre-upgrade screenshot, at a maximum channel delta of 24 out of 765 — invisible
side by side, and byte-identical across two runs on the same build. Do not read that as a
regression; recapture the baseline instead. The routes without large images compared at 0 pixels.
