# Sub-project C Implementation Plan

## Step 1: Package, Constants, Route Access, Schemas & API
1. Install `socket.io-client` in `D:\luyenthiao\luyenthiao.com-Web\src`.
2. Update `src/schemas/planet.ts` & `src/schemas/planet.test.ts` (`comingSoon: false` for `/challenges*`).
3. Update `src/constants/index.ts` (`ROUTES.CHALLENGES`, `CHALLENGE_ROOM`, `CHALLENGE_RESULT`), `src/lib/route-access.ts` + `route-access.test.ts` (`/challenges` & `/challenges/result/*` public; `/challenges/room/*` protected).
4. Create `src/schemas/challenge.ts`, `src/lib/challenge-socket.ts`, `src/lib/api/challenges.ts`, extend `src/lib/query-keys.ts` (`myChallengeHistory`, `publicChallengeResult`), create `src/hooks/use-challenges.ts` & export in `src/hooks/index.ts`.

## Step 2: Arena Components & Routes
1. Create `src/components/challenges/challenge-question-card.tsx` handling `multichoice`, `gapfill`, `matching`, `dragdrop` + `REACTION_EMOJIS`.
2. Create `src/components/challenges/challenge-lobby-view.tsx` (Create room + Join by code + History table).
3. Create `src/components/challenges/challenge-room-view.tsx` (Waiting room + Add Bot + Start + Countdown + Live Arena + Leaderboard + Reactions).
4. Create `src/components/challenges/challenge-result-view.tsx` + `src/components/challenges/index.ts`.
5. Create routes:
   - `src/app/(dashboard)/challenges/page.tsx`
   - `src/app/(dashboard)/challenges/[slug]/page.tsx`
   - `src/app/challenges/room/[code]/page.tsx`
   - `src/app/challenges/result/[id]/page.tsx`
6. Wire `"Thách đấu"` in `src/components/common/topbar.tsx` & `src/components/common/mobile-nav-drawer.tsx` -> `ROUTES.CHALLENGES`.

## Step 3: Verification
1. Write unit/component tests: `src/schemas/challenge.test.ts`, `src/components/challenges/challenge-views.test.tsx`.
2. Run `tsc --noEmit`, `eslint`, `vitest run`, and `npm run build`.
