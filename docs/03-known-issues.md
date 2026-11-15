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

- `/ranking` logs a React hydration mismatch and a warning about `selected` on `<option>`.
- Every page logs one 404 for a missing static resource.

## 5. Unused dev dependencies

`tsx` and `playwright` are no longer used by any script in `src/` (their former users were
archived). `playwright` is still used for manual screenshot verification outside the repo.
Decide whether to keep them when the tooling is set up again.

## 6. AI guidance

`AGENTS.md`, `CLAUDE.md` and `.claude/` describe the layout as of the phase 1 restructure
(2026-11-15). Update them when the layout changes.
