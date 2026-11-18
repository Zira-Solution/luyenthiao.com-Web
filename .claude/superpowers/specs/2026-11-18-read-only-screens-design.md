# Sub-project 2: Read-Only Screens on the Real API — Design

Status: approved by the owner on 2026-11-18 ("ok" to the presented design).

Program: `.claude/superpowers/specs/2026-11-18-web-security-foundation-design.md` §0, row 2. Backend half:
`luyenthiao.com-Backend/.claude/superpowers/specs/2026-11-18-public-ranking-m4-node-pin-design.md`
(M4 ranking shapes + pinned Node). The backend half lands first; the web consumes its ranking shapes.

Owner choices on 2026-11-18:

- Public ranking shows "given name + family initial" (computed by the backend, `displayName`).
- Notebook: wire it to the API, keep the Grammar tab as "coming soon".
- Data fetching: public data rendered on the Next server and cached for 60 s; private data fetched in the
  browser with TanStack Query.
- UI controls with no backend data are removed or adapted, not faked and not added to the backend.
- `/write` and `/speaking` keep requiring login; their real flow is sub-project 4.
- Images and media (avatars included) will live on R2 with Zoney's mechanism, in a new sub-project
  "Media on R2" right after this one. Avatars are never shown on the public ranking, only on screens
  that require login. This sub-project therefore ships no avatar images.

## 1. Scope

| Screen | Route | Today | API |
|---|---|---|---|
| Dashboard planet map | `/` | `mocks/planets.json` | `GET /planets/public` |
| Student ranking | `/ranking` | `mocks/ranking.json` | `GET /ranking`, `GET /ranking/me`, `GET /schools/public` |
| School ranking | `/school-ranking` | `mocks/school-ranking.ts` | `GET /ranking/schools` |
| Notifications (+ Topbar badge) | `/notifications` | `mocks/notifications.ts` | `GET /notifications/my`, `GET /notifications/unread-count`, `POST /notifications/:id/read`, `POST /notifications/read-all` |
| Tasks | `/tasks` | `mocks/tasks.ts` | `GET /tasks/my`, `POST /tasks/:id/claim` |
| History | `/history` | `mocks/history.json` | `GET /history/my` |
| Notebook | `/notebook` | `components/notebook/notebook-data.ts` | `GET /notebook/my`, `PATCH /notebook/:id`, `DELETE /notebook/:id` |

Out of scope: `site-config` (no screen in this list reads it), `POST /notebook/save` (words are added
while doing an exam: sub-project 3), the exam-review link from History (sub-project 3), uploads and
`next.config` `images.remotePatterns` for the media CDN (sub-project "Media on R2").

CSP note (corrected 2026-11-18): `img-src` and `media-src` already allow `https:`
(`src/lib/security-headers.ts:40-41`), so HTTPS images and audio from any host load; nothing in this
sub-project needs a CSP change.

## 2. Data layer

### 2.1 Public data on the server

`src/lib/api/public.ts`, first line `import 'server-only'` (install `server-only`, exact version: Next
does not require it — `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md:584`
— but Vitest must resolve the import). Functions:

```ts
type PublicResult<T> = { ok: true; data: T } | { ok: false }

getPlanets(): Promise<PublicResult<Planet[]>>
getStudentRanking(q: { period: RankingPeriod; schoolId?: number; page: number }): Promise<PublicResult<RankingPage<StudentRankRow>>>
getSchoolRanking(q: { period: RankingPeriod; page: number }): Promise<PublicResult<RankingPage<SchoolRankRow>>>
getPublicSchools(): Promise<PublicResult<SchoolOption[]>>
```

- `fetch(`${env.API_URL}${path}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } })`
  (previous caching model: `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`;
  this app does not enable `cacheComponents`).
- The response is parsed with the domain's zod schema, then mapped to the view type.
- **Never throws.** A network error, timeout, non-2xx status or schema mismatch returns `{ ok: false }` and
  logs one `console.error('[public-api] <path>: <reason>')`. The page then renders an inline "Tạm thời
  không tải được dữ liệu, vui lòng thử lại sau." state. This keeps `next build` green when the backend is
  unreachable (CI and Vercel build without one).
- Pages pass only validated query values: `period` ∈ `week | month | all` (default `all`; sent to the
  backend as `WEEK | MONTH` or omitted), `page` an integer 1–100 (default 1), `school` a positive integer
  or absent. Anything else falls back to the default, so arbitrary query strings do not multiply backend
  calls.

Known risk, not solved here: server-side calls come from Vercel's egress IPs and share the backend's
default throttle (300 requests/min per IP, backend `app/app.module.ts:46`). The 60 s cache and the
validated parameter space keep the volume low; watch for 429s in the `[public-api]` logs.

### 2.2 Private data in the browser

Per domain: `src/schemas/<domain>.ts` (zod schema of the **backend** shape, imported from `@/lib/zod`),
`src/lib/api/<domain>.ts` (calls `authFetch`, parses, maps to the view type), `src/hooks/use-<domain>.ts`
(TanStack Query). Query keys live in `src/lib/query-keys.ts`; every private key starts with `'me'`
(`['me', 'notifications', filter]`, `['me', 'tasks']`, …).

- Queries run only when the auth store says `status === 'authenticated'` (`enabled`).
- Retry only transient failures: `retry: (n, e) => n < 2 && e instanceof ApiError && (e.status === 0 || e.status >= 500)`.
- A mutation invalidates the keys it changes (claim → tasks; read/read-all → notifications list and
  unread count; notebook patch/delete → notebook).
- **Session end clears private data:** a small client component inside `QueryProvider` watches the auth
  store; when the status leaves `authenticated`, it calls `queryClient.removeQueries({ queryKey: ['me'] })`.
  Otherwise the next person to log in on the same tab would briefly see the previous student's data.
- Errors shown to the user are `ApiError.message` (already generic for non-API and 5xx errors).
- Each screen has four states: loading, empty, error (with a "Thử lại" button calling `refetch`), data.

Schemas follow the backend responses exactly (field lists in §3); dates arrive as ISO strings.
Unknown enum values are mapped, not rejected (notification `type` → `system`, task `actionType` → a
default icon), so a new backend value does not blank the screen. Empty strings mean "absent" (the real
payload sends `audioUrl: ""`, `linkUrl: ""`, `notes: ""`).

Real payloads captured on 2026-11-18 (dev seed, student `hs_an`) drive the mappings below: notification
`type` values `REWARD | EVENT | ANNOUNCEMENT`; task `category` values `DAILY | WEEKLY | ACHIEVEMENT`;
task `actionType` values `COMPLETE_EXAM | SCORE_90 | COMPLETE_SPEAKING | COMPLETE_WRITING | PLAY_CHALLENGE`;
history `status` seen `pending | passed`; planets `image` are relative `/clone-assets/...` paths.

## 3. Screens

### 3.1 Dashboard (`components/dashboard/dashboard-view.tsx`)

The page fetches `getPlanets()` and passes the list to the client view.
Mapping: `slug` → routing id, `name`, `subtitle` → description, `image`, `glowColor` → shadow colour,
`ribbonFrom`/`ribbonTo` → the gradient (inline style, not a Tailwind class built at runtime).
Target: `linkUrl` when non-empty, otherwise `/testlevels/<slug>` (the current behaviour for the exam
levels). A target under `/challenges` is shown as "Sắp ra mắt" and not clickable until sub-project 5 adds
that route (the seeded IOE planet has `linkUrl: "/challenges"`). The hard-coded clickable list goes.
Order: `sortOrder`.
Images keep going through `next/image`. `next.config.ts` has no `images` block, so `next/image` accepts
only local paths: if the real payload has relative `/clone-assets/...` paths they work as is; an
absolute URL is rendered with a plain `<img>` (no `remotePatterns` until "Media on R2"). Verify against
the real payload.

### 3.2 Student ranking (`/ranking`)

Server-rendered from `?period=&school=&page=`.
Row: `rank`, `displayName`, `schoolName`, `totalPoints`; avatar = a CSS circle with the first letter of
`displayName` (the public ranking never shows avatars — owner choice; `public/` has no student avatar
asset and no external avatar service is used).
Controls: period tabs Tuần / Tháng / Tất cả, a school dropdown from `getPublicSchools()`, pagination
(50 per page, `total` from the response). Removed: day/year tabs, level/city/class-code filters, the
location column.
"Hạng của tôi": a client component that, when authenticated, calls `GET /ranking/me?period=` and shows
`rank`, `fullName`, `totalPoints`. No table row is highlighted: ranks tie (two students share rank 1 in
the real payload), so a rank cannot identify the caller's row.
Guests see a "Đăng nhập để xem hạng của bạn" link (`/login?redirect=/ranking`).

### 3.3 School ranking (`/school-ranking`)

Server-rendered from `?period=&page=`. Row: `rank`, `name`, `city`, `studentCount`, `totalPoints`.
Period tabs as in §3.2; the level filter goes.

### 3.4 Notifications

List from `GET /notifications/my?filter=all|unread` (tabs map to `filter`), `isRead` → read state,
`createdAt` → relative time in Vietnamese (a small pure helper, unit-tested; no new library).
Clicking an unread item calls `POST /:id/read`; "Đánh dấu tất cả đã đọc" calls `POST /read-all`.
Type map: `REWARD` → reward, `EVENT` → event, `ANNOUNCEMENT` and anything else → system (the web's
`result`/`challenge` icons stay unused until the backend sends such types).
Topbar bell: a red badge with `GET /unread-count` (`count`, shown as `9+` above 9), only when
authenticated; `staleTime` 60 s and refetch on window focus.

### 3.5 Tasks

`GET /tasks/my`, grouped by `category` (`DAILY` → "Nhiệm vụ hằng ngày", `WEEKLY` → "Nhiệm vụ hằng
tuần", `ACHIEVEMENT` → "Thành tích", others → "Nhiệm vụ khác"). Progress `currentCount/targetCount`, reward `points` "điểm".
Button: "Nhận thưởng" when `completed && !claimed`, "Đã nhận" when `claimed`, disabled otherwise.
Claim errors: 400 → "Chưa hoàn thành nhiệm vụ.", 409 → "Bạn đã nhận thưởng nhiệm vụ này.", 404 →
"Nhiệm vụ không còn tồn tại."; then the list is refetched. The hard-coded coin/diamond balances go.

### 3.6 History

`GET /history/my` with `kind` (`EXAM | WRITING | SPEAKING`, tabs Thi / Viết / Nói / Tất cả), `status`
and `levelSlug` as query params; the text search filters `title` in the browser.
Row: `title`, level label from `levelSlug` (a fixed map of the seeded slugs `ioe`, `starters`, `movers`,
`flyers`, `toefl_primary` → display label; empty slug → "—"; unknown slug shown as is), kind label, `score/maxScore`, `correctCount/totalQuestions`, status
label (`passed` Đạt, `failed` Chưa đạt, `pending` Chờ chấm, `graded` Đã chấm), `createdAt` formatted
`dd/MM/yyyy HH:mm`. The `isTrialMode` toggle goes (the route is behind `RequireAuth`). No detail link
yet. The backend caps the list at 200 items; no pagination in the UI.

### 3.7 Notebook

`GET /notebook/my`. Card: `vocab.word`, `vocab.ipa`, `vocab.type`, `vocab.meaningVi`,
`vocab.exampleEn`/`exampleVi` (hide a missing example), level label from `vocab.level` (same map as
§3.6), star = `isFavorite`, a "Đã thuộc" toggle = `memorized`.
Star / memorized toggles call `PATCH /:id`; delete calls `DELETE /:id` after a confirm. Search and level
filter run in the browser. Tabs: Từ vựng (all), Đánh dấu sao (`isFavorite`), Ngữ pháp → a "Sắp có"
panel. Empty state: "Sổ tay trống. Từ bạn tra trong lúc làm bài sẽ xuất hiện ở đây."
Pronunciation plays `vocab.audioUrl` with an `<audio>` element when it is non-empty, and falls back to the
current `speechSynthesis` otherwise. `MOCK_WORDS` goes.

## 4. Removed files

`mocks/planets.json`, `mocks/ranking.json`, `mocks/school-ranking.ts`, `mocks/notifications.ts`,
`mocks/tasks.ts`, `mocks/history.json` and the matching cases in `mocks/mocks.test.ts`, plus
`MOCK_WORDS` — each only if no other file still imports it (check before deleting). The mock-shaped
types in `types/notification.ts`, `types/task.ts`, `types/ranking.ts` are replaced by view types derived
next to the schemas.

## 5. Verification

- Unit: every schema + mapper against fixtures **copied from the real backend responses** (captured
  during the work, stored under `src/schemas/__fixtures__/`); the public fetchers return `{ ok: false }`
  on timeout, 500 and a wrong shape; parameter validation of §2.1; the relative-time and level-label
  helpers; each hook calls the right endpoint and invalidates the right keys; the session-end cleanup.
- `npm run build` passes with the backend stopped.
- Tier 2 with the real backend (`luyenthiao.com-Backend` on `dev`, port 3005): every screen as a guest
  and as a logged-in student; compare each real payload with its schema (no missing or extra field);
  claim a task, mark notifications read, toggle and delete a notebook entry on the dev database.
- Baselines unchanged: `tsc` 0 errors, lint at most the 8 known errors, all tests green.
- Owner: browser check of the console (no CSP violation) on `/`, `/ranking`, `/notifications`.
