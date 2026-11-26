# Sub-project C Design: Live Online Arena (`/challenges`) + Socket.IO `/challenge`

## 1. Scope & Goals
Integrate the full realtime Multiplayer Arena (`challenges` module on Backend) into `luyenthiao.com-Web`:
1. Unlock `/challenges` and `/challenges/[slug]` planets (`comingSoon: false` in `src/schemas/planet.ts`) and wire Topbar + MobileNavDrawer `"Thách đấu"` buttons directly to `/challenges`.
2. Connect WebSocket client (`socket.io-client`) to NestJS `/challenge` namespace (`${ORIGIN}/challenge`, handshake `auth: { token: accessToken }`).
3. Implement Lobby (`/challenges`, `/challenges/[slug]`), Live Arena Room (`/challenges/room/[code]`), and Public Match Result (`/challenges/result/[id]`).
4. Integrate `GET /api/challenges/history` (`JwtAuthGuard`) and `GET /api/challenges/result/:id` (public).

## 2. Architecture & Routes
- **Dependencies:** `socket.io-client` in `luyenthiao.com-Web/src/package.json`.
- **Route Access (`src/lib/route-access.ts`):**
  - Keep `/challenges` and `/challenges/[slug]` and `/challenges/result/[id]` accessible without login (`PUBLIC_PATHS` entries `'/challenges'` — note: `/challenges/room/[code]` enforces auth client-side via `useAuthStore` + `redirect`, OR `decideRoute` handles `/challenges/room` specifically as protected while `/challenges`, `/challenges/[slug]`, and `/challenges/result/*` are public! Adding an explicit check so `/challenges/room/*` redirects guests to `/login?redirect=...` at edge/proxy AND client level is super clean!).
- **Schemas (`src/schemas/challenge.ts`):**
  - `clientQuestionSchema`, `roomPlayerSchema`, `roomStateSchema`, `leaderboardPayloadSchema`, `challengeHistoryItemSchema`, `challengeResultSchema`, `reactionBroadcastSchema`.
- **API & Socket Modules:**
  - `src/lib/api/challenges.ts`: `fetchChallengeHistory()` (`authFetch('/challenges/history')`), `fetchChallengeResult(id)` (`apiFetch('/challenges/result/:id')`).
  - `src/lib/challenge-socket.ts`: derives Socket.IO namespace URL (`env.API_URL.replace(/\/api\/?$/, '') + '/challenge'`) and connects with fresh `useAuthStore.getState().accessToken`.
  - `src/hooks/use-challenges.ts`: `useChallengeHistory()`, `useChallengeResult(id)`, plus `useChallengeRoomSocket(code, options)` managing Socket.IO lifecycle (`connect`, `room:join`, `room:state`, `game:countdown`, `game:begin`, `leaderboard`, `reaction:broadcast`, `game:end`, `room:error`, automatic cleanup on unmount).
- **Pages & Views:**
  - `src/app/(dashboard)/challenges/page.tsx` & `src/app/(dashboard)/challenges/[slug]/page.tsx` -> `<ChallengeLobbyView initialSlug={slug} />`:
    - Create Room form: level picker (from `getPlanets()` / standard levels), exam picker (`fetchPublicExamsClient(level)` excluding pure manual-only exams cleanly or warning if an exam has 0 quiz questions), title input, maxPlayers (2/4/6), emits `room:create` on temporary/shared socket -> routes to `/challenges/room/${code}`.
    - Join by Code form: 6-char uppercase code -> routes to `/challenges/room/${code}`.
    - Recent Challenge History table (`GET /challenges/history` for signed-in users, linking rows to `/challenges/result/${item.resultId}`).
  - `src/app/challenges/room/[code]/page.tsx` -> `<ChallengeRoomView code={code} />`:
    - Waiting Room: Copyable room code, Share URL, Player list (host/bot/human), Host `"Thêm Bot AI"` (`room:add_bot`) & `"Bắt đầu"` (`game:start`), Leave room (`room:leave`), Reaction bar (`👍 ❤️ 😂 😮 😢 🔥` with 1.5s client cooldown).
    - Countdown Overlay: 3..2..1 visual countdown on `game:countdown`.
    - Live Race Arena: Header countdown clock from `startedAt + totalMs`, Question pills (`1..N`), `ChallengeQuestionView` rendering `multichoice`, `gapfill`, `matching`, and `dragdrop` using `<SafeHtml>` for `promptHtml`, throttled `answer:sync`, explicit `"Nộp bài"` (`answer:submit`), live Leaderboard + floating Reactions, auto-navigation to `/challenges/result/${resultId}` on `game:end`.
  - `src/app/challenges/result/[id]/page.tsx` -> `<ChallengeResultView id={id} />`:
    - Fetches `GET /challenges/result/${id}`, renders Top 3 podium, full player scoreboard highlighting the logged-in user (matching `userId` first then name fallback, per BE comment), Share Link copy, and navigation to `/challenges` & `/`.

## 3. Non-Goals & Safety
- Render `promptHtml` ONLY via `<SafeHtml>` so `no-raw-html.test.ts` stays 100% green.
- Never render missing `/clone-assets/challenges/*` images from `siteConfig.challengeAssets` unless Admin customized them away from `DEFAULT_SITE_CONFIG_CLIENT`.
- Keep all private queries (`useChallengeHistory`) under `queryKeys.me()` (`myChallengeHistory`).
