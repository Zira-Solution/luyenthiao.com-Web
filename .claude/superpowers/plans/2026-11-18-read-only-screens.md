# Read-Only Screens on the Real API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dashboard, both rankings, notifications (+ Topbar badge), tasks, history and notebook read the real `luyenthiao.com-Backend` API instead of `src/mocks`.

**Architecture:** Public data (planets, rankings, schools) is fetched on the Next server by a `server-only` module with `fetch(..., { next: { revalidate: 60 } })`, validated with zod, and never throws (a failed call renders an inline error state, so `next build` works without a backend). Private data is fetched in the browser through `authFetch` + zod + TanStack Query hooks keyed under `'me'`; a provider component removes those queries when the session ends.

**Tech Stack:** Next.js 16.4 (App Router, no `cacheComponents`), React 19, TanStack Query 5, zustand 5, zod 4 via `@/lib/zod`, Vitest 4 + Testing Library (jsdom).

Spec: `.claude/superpowers/specs/2026-11-18-read-only-screens-design.md` (read §2 and the §3 section of your task). Backend half already merged on backend `dev` (`ec0ebb2`): public `/ranking` rows are `{rank, displayName, schoolName, totalPoints}`.

## Conventions for every task

- Run npm/npx from `src/` with an **upper-case drive**: `cd /E/Ziratech/English-Prep-Web-Game/luyenthiao.com-Web/src` (a lower-case `e:` cwd makes Vitest load twice and every file fails — `docs/03-known-issues.md` §8).
- Import zod only from `@/lib/zod`. Vitest has no globals: import `describe/it/expect/vi` from `vitest`; component tests call `cleanup()` in `afterEach` (see `components/auth/require-auth.test.tsx`).
- Code, comments, test names: English. UI strings: Vietnamese, exactly as written in this plan.
- Format only changed files: `npx prettier --write <files>`. Never `npm run format`.
- Baselines: `npx tsc --noEmit` 0 errors; `npm run lint` exactly the 8 known `import-x/order` errors; `npm test` 18 files / 205 tests before Task 1.
- No state-changing git. The controller commits after both reviews.
- Real payload fixtures (captured from the dev backend on 2026-11-18, student `hs_an`) are in `src/schemas/__fixtures__/` after Task 1. Tests use them; do not hand-write backend shapes.
- UI tasks change existing components. Keep the existing look (classes, images, layout); change only the data source and the controls this plan names. Remove dead code (mock imports, unused state) you replace.

## File map

| File | Responsibility |
|---|---|
| `lib/query-keys.ts` | all private query keys, rooted at `'me'` |
| `lib/private-query.ts` | `retryTransient`, `useIsAuthenticated` |
| `providers/private-data-cleanup.tsx` | removes `'me'` queries when the session ends or the user changes |
| `lib/format.ts` | `formatRelativeTimeVi`, `formatDateTimeVi` |
| `lib/level-label.ts` | level slug → label |
| `lib/api/parse.ts` | `parseOrThrow` for private responses |
| `lib/api/public-result.ts` | `PublicResult<T>` type (importable from client code) |
| `lib/api/public.ts` | `server-only` public fetchers |
| `lib/ranking-params.ts` | validated ranking query parsing + href builder |
| `schemas/{planet,ranking,notification,task,history,notebook}.ts` | backend zod schemas + mappers to view types |
| `lib/api/{ranking-me,notifications,tasks,history,notebook}.ts` | private API calls |
| `hooks/use-{my-rank,notifications,tasks,history,notebook}.ts` | TanStack Query hooks |
| `schemas/__fixtures__/*.json` | real payloads |

---

### Task 1: Foundation — `server-only`, fixtures, query keys, session cleanup

**Files:**
- Modify: `src/package.json`, `src/package-lock.json` (via npm)
- Create: `src/schemas/__fixtures__/*.json` (12 files)
- Create: `src/lib/query-keys.ts`, `src/lib/private-query.ts`, `src/providers/private-data-cleanup.tsx`
- Modify: `src/providers/query-provider.tsx`
- Test: `src/providers/private-data-cleanup.test.tsx`, `src/lib/private-query.test.ts`

- [ ] **Step 1: Install `server-only` (exact)**

Run: `npm install --save-exact server-only@0.0.1`
Expected: `"server-only": "0.0.1"` in `dependencies`. (0.0.1 is the only published version; it throws when imported outside the `react-server` condition, so tests mock it — Task 3.)

- [ ] **Step 2: Copy the fixtures**

The controller captured them in `C:\Users\lemin\AppData\Local\Temp\lha-fixtures\` (Git Bash: `/tmp/lha-fixtures/`). Copy all 12 files:

```bash
mkdir -p schemas/__fixtures__ && cp /tmp/lha-fixtures/*.json schemas/__fixtures__/
ls schemas/__fixtures__
```
Expected: `history.json notebook.json notifications.json planets.json ranking-me.json ranking-schools.json ranking-week.json ranking.json schools.json site-config.json tasks.json unread.json`. Delete `site-config.json` (out of scope). Run `npx prettier --write schemas/__fixtures__/*.json`.

- [ ] **Step 3: Write the failing tests**

`src/lib/private-query.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api-client'
import { retryTransient } from '@/lib/private-query'

describe('retryTransient', () => {
  it('retries network failures and 5xx at most twice', () => {
    expect(retryTransient(0, new ApiError('x', 0))).toBe(true)
    expect(retryTransient(1, new ApiError('x', 503))).toBe(true)
    expect(retryTransient(2, new ApiError('x', 503))).toBe(false)
  })

  it('never retries 4xx, a bad payload, or a non-ApiError', () => {
    expect(retryTransient(0, new ApiError('x', 401))).toBe(false)
    expect(retryTransient(0, new ApiError('x', 404))).toBe(false)
    expect(retryTransient(0, new ApiError('x', 200, 'INVALID_RESPONSE'))).toBe(false)
    expect(retryTransient(0, new Error('boom'))).toBe(false)
  })
})
```

`src/providers/private-data-cleanup.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { queryKeys } from '@/lib/query-keys'
import { PrivateDataCleanup } from '@/providers/private-data-cleanup'
import { useAuthStore } from '@/store/auth-store'
import type { User } from '@/types/auth'

const userA = { id: 1, username: 'a' } as unknown as User
const userB = { id: 2, username: 'b' } as unknown as User

function setup(): QueryClient {
  const client = new QueryClient()
  client.setQueryData(queryKeys.tasks(), ['private'])
  client.setQueryData(['public-thing'], ['public'])
  render(
    <QueryClientProvider client={client}>
      <PrivateDataCleanup />
    </QueryClientProvider>,
  )
  return client
}

describe('PrivateDataCleanup', () => {
  beforeEach(() => {
    act(() => useAuthStore.getState().setSession('token-a', userA))
  })
  afterEach(() => {
    cleanup()
    useAuthStore.setState({ accessToken: null, user: null, status: 'idle', signedOut: false })
  })

  it('removes private queries when the session ends', () => {
    const client = setup()
    act(() => useAuthStore.getState().clearSession('logout'))
    expect(client.getQueryData(queryKeys.tasks())).toBeUndefined()
    expect(client.getQueryData(['public-thing'])).toEqual(['public'])
  })

  it('removes private queries when another user signs in', () => {
    const client = setup()
    act(() => useAuthStore.getState().setSession('token-b', userB))
    expect(client.getQueryData(queryKeys.tasks())).toBeUndefined()
  })

  it('keeps private queries when the same user refreshes the token', () => {
    const client = setup()
    act(() => useAuthStore.getState().setSession('token-a2', userA))
    expect(client.getQueryData(queryKeys.tasks())).toEqual(['private'])
  })
})
```

Check `src/types/auth.ts` for the `User` shape; if `id` is not a number there, keep the cast but use the real field type.

- [ ] **Step 4: Run them to verify they fail**

Run: `npx vitest run lib/private-query.test.ts providers/private-data-cleanup.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 5: Implement**

`src/lib/query-keys.ts`:

```ts
import type { HistoryQuery } from '@/schemas/history'
import type { RankingPeriod } from '@/schemas/ranking'

/**
 * Every query that holds one student's data starts with 'me', so PrivateDataCleanup can drop them all
 * when the session ends (spec 2026-11-18-read-only-screens §2.2).
 */
export const queryKeys = {
  me: () => ['me'] as const,
  notificationsAll: () => ['me', 'notifications'] as const,
  notifications: (filter: 'all' | 'unread') => ['me', 'notifications', 'list', filter] as const,
  unreadCount: () => ['me', 'notifications', 'unread-count'] as const,
  tasks: () => ['me', 'tasks'] as const,
  history: (query: HistoryQuery) => ['me', 'history', query] as const,
  notebook: () => ['me', 'notebook'] as const,
  myRank: (period: RankingPeriod) => ['me', 'rank', period] as const,
}
```

(`HistoryQuery` and `RankingPeriod` are created in Tasks 7 and 3. Until then, declare them locally in this file as
`type HistoryQuery = { kind?: string; status?: string; levelSlug?: string }` and `type RankingPeriod = 'week' | 'month' | 'all'`; Tasks 3 and 7 replace the local declarations with the imports above.)

`src/lib/private-query.ts`:

```ts
'use client'

import { ApiError } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'

/** Retry only what may succeed on a second try: network failures and 5xx, at most twice. */
export function retryTransient(failureCount: number, error: unknown): boolean {
  return (
    failureCount < 2 && error instanceof ApiError && (error.status === 0 || error.status >= 500)
  )
}

/** Private queries run only for a signed-in student (`enabled`). */
export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.status === 'authenticated')
}
```

`src/providers/private-data-cleanup.tsx`:

```tsx
'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/store/auth-store'

/**
 * Drops every 'me' query when the session ends or a different user signs in, so the next person on
 * the same tab never sees the previous student's data.
 */
export function PrivateDataCleanup(): null {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      useAuthStore.subscribe((state, prev) => {
        const ended = prev.status === 'authenticated' && state.status !== 'authenticated'
        const switched =
          prev.status === 'authenticated' &&
          state.status === 'authenticated' &&
          prev.user?.id !== state.user?.id
        if (ended || switched) queryClient.removeQueries({ queryKey: queryKeys.me() })
      }),
    [queryClient],
  )

  return null
}
```

`src/providers/query-provider.tsx`: render `<PrivateDataCleanup />` as the first child inside `<QueryClientProvider>`; leave the `QueryClient` options unchanged.

- [ ] **Step 6: Run the tests, then the suite**

Run: `npx vitest run lib/private-query.test.ts providers/private-data-cleanup.test.tsx` → PASS (5 tests).
Run: `npm test` → 20 files / 210 tests. `npx tsc --noEmit` → 0 errors.

---

### Task 2: Shared helpers — formatting, level labels, payload parsing

**Files:**
- Create: `src/lib/format.ts`, `src/lib/level-label.ts`, `src/lib/api/parse.ts`
- Test: `src/lib/format.test.ts`, `src/lib/level-label.test.ts`, `src/lib/api/parse.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/lib/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { formatDateTimeVi, formatRelativeTimeVi } from '@/lib/format'

const now = new Date('2026-11-18T10:00:00.000Z')

describe('formatRelativeTimeVi', () => {
  it.each([
    ['2026-11-18T09:59:30.000Z', 'Vừa xong'],
    ['2026-11-18T09:55:00.000Z', '5 phút trước'],
    ['2026-11-18T07:00:00.000Z', '3 giờ trước'],
    ['2026-11-16T10:00:00.000Z', '2 ngày trước'],
    ['2026-11-01T10:00:00.000Z', '01/11/2026'],
    ['2026-11-18T10:05:00.000Z', 'Vừa xong'],
  ])('%s -> %s', (iso, expected) => {
    expect(formatRelativeTimeVi(iso, now)).toBe(expected)
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatRelativeTimeVi('nope', now)).toBe('')
  })
})

describe('formatDateTimeVi', () => {
  it('formats in Vietnam time as dd/MM/yyyy HH:mm', () => {
    expect(formatDateTimeVi('2026-11-17T02:13:29.485Z')).toBe('17/11/2026 09:13')
  })

  it('returns an empty string for an invalid date', () => {
    expect(formatDateTimeVi('')).toBe('')
  })
})
```

`src/lib/level-label.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { LEVEL_OPTIONS, levelLabel } from '@/lib/level-label'

describe('levelLabel', () => {
  it('maps the seeded slugs', () => {
    expect(levelLabel('starters')).toBe('Starters (Pre A1)')
    expect(levelLabel('movers')).toBe('Movers (A1)')
    expect(levelLabel('flyers')).toBe('Flyers (A2)')
    expect(levelLabel('ioe')).toBe('IOE')
    expect(levelLabel('toefl_primary')).toBe('TOEFL Primary')
  })

  it('shows an unknown slug as is and an empty one as a dash', () => {
    expect(levelLabel('ket')).toBe('ket')
    expect(levelLabel('')).toBe('—')
  })

  it('offers every known level as a filter option', () => {
    expect(LEVEL_OPTIONS.map((o) => o.value)).toEqual([
      'ioe',
      'starters',
      'movers',
      'flyers',
      'toefl_primary',
    ])
  })
})
```

`src/lib/api/parse.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api-client'
import { parseOrThrow } from '@/lib/api/parse'
import { z } from '@/lib/zod'

describe('parseOrThrow', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns the parsed value', () => {
    expect(parseOrThrow(z.object({ n: z.number() }), { n: 1 }, '/x')).toEqual({ n: 1 })
  })

  it('throws a non-retryable ApiError and logs the path on a wrong shape', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    let error: unknown
    try {
      parseOrThrow(z.object({ n: z.number() }), { n: 'one' }, '/tasks/my')
    } catch (err) {
      error = err
    }
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toBe(GENERIC_ERROR_MESSAGE)
    expect((error as ApiError).code).toBe('INVALID_RESPONSE')
    expect((error as ApiError).status).toBe(200)
    expect(log).toHaveBeenCalledWith(expect.stringContaining('/tasks/my'))
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run lib/format.test.ts lib/level-label.test.ts lib/api/parse.test.ts` → FAIL (modules not found).

- [ ] **Step 3: Implement**

`src/lib/format.ts`:

```ts
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const dateTimeParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** `dd/MM/yyyy HH:mm` in Vietnam time; '' for an invalid date. */
export function formatDateTimeVi(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    dateTimeParts.formatToParts(date).find((p) => p.type === type)?.value ?? ''
  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}`
}

/** "Vừa xong", "5 phút trước", "3 giờ trước", "2 ngày trước", then the date; '' for an invalid date. */
export function formatRelativeTimeVi(iso: string, now: Date = new Date()): string {
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ''
  const diff = Math.max(0, now.getTime() - time)
  if (diff < MINUTE) return 'Vừa xong'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút trước`
  if (diff < DAY) return `${Math.floor(diff / HOUR)} giờ trước`
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} ngày trước`
  return formatDateTimeVi(iso).slice(0, 10)
}
```

`src/lib/level-label.ts`:

```ts
/** Level slugs seeded by the backend (`planets`, `exams.levelSlug`, `vocab.level`). */
const LEVEL_LABELS: Record<string, string> = {
  ioe: 'IOE',
  starters: 'Starters (Pre A1)',
  movers: 'Movers (A1)',
  flyers: 'Flyers (A2)',
  toefl_primary: 'TOEFL Primary',
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export function levelLabel(slug: string): string {
  if (!slug) return '—'
  return LEVEL_LABELS[slug] ?? slug
}
```

`src/lib/api/parse.ts`:

```ts
import { ApiError, GENERIC_ERROR_MESSAGE } from '@/lib/api-client'
import type { z } from '@/lib/zod'

/**
 * Validates a private API response. A wrong shape means the contract drifted: log the path (never the
 * body, it holds a student's data) and throw a non-retryable error the UI shows generically.
 */
export function parseOrThrow<S extends z.ZodType>(schema: S, data: unknown, path: string): z.output<S> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(`[api] ${path}: unexpected response shape`)
    throw new ApiError(GENERIC_ERROR_MESSAGE, 200, 'INVALID_RESPONSE')
  }
  return parsed.data
}
```

- [ ] **Step 4: Run them**

Run: `npx vitest run lib/format.test.ts lib/level-label.test.ts lib/api/parse.test.ts` → PASS. `npx tsc --noEmit` → 0.
If `formatDateTimeVi` disagrees with the expected string because of the runtime's ICU, read the parts it produced and fix the implementation, not the expectation (`2026-11-17T02:13Z` is 09:13 in UTC+7).

---

### Task 3: Public data layer

**Files:**
- Create: `src/schemas/planet.ts`, `src/schemas/ranking.ts`, `src/lib/ranking-params.ts`, `src/lib/api/public-result.ts`, `src/lib/api/public.ts`
- Modify: `src/lib/query-keys.ts` (import `RankingPeriod` from `@/schemas/ranking`)
- Test: `src/schemas/planet.test.ts`, `src/schemas/ranking.test.ts`, `src/lib/ranking-params.test.ts`, `src/lib/api/public.test.ts`

- [ ] **Step 1: Write the failing tests**

`src/schemas/planet.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets } from '@/schemas/planet'

describe('planets', () => {
  it('parses the real payload and maps it in sortOrder', () => {
    const result = toPlanets(planetsSchema.parse(planets))
    expect(result.map((p) => p.slug)).toEqual(['ioe', 'starters', 'movers', 'flyers', 'toefl_primary'])
    expect(result[1]).toEqual({
      slug: 'starters',
      name: planets[1].name,
      description: planets[1].subtitle,
      image: planets[1].image,
      glowColor: planets[1].glowColor,
      ribbonFrom: planets[1].ribbonFrom,
      ribbonTo: planets[1].ribbonTo,
      href: '/testlevels/starters',
      comingSoon: false,
    })
  })

  it('uses linkUrl when set and marks /challenges as coming soon', () => {
    const [ioe] = toPlanets(planetsSchema.parse(planets))
    expect(ioe.href).toBe('/challenges')
    expect(ioe.comingSoon).toBe(true)
  })
})
```

(If `planets.json` is not already ordered by `sortOrder`, compute the expected order from the fixture instead of the literal list.)

`src/schemas/ranking.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import rankingMe from '@/schemas/__fixtures__/ranking-me.json'
import schoolRanking from '@/schemas/__fixtures__/ranking-schools.json'
import ranking from '@/schemas/__fixtures__/ranking.json'
import schools from '@/schemas/__fixtures__/schools.json'
import {
  myRankSchema,
  publicSchoolsSchema,
  schoolRankingPageSchema,
  studentRankingPageSchema,
} from '@/schemas/ranking'

describe('ranking schemas', () => {
  it('parse the real payloads', () => {
    expect(studentRankingPageSchema.parse(ranking)).toEqual(ranking)
    expect(schoolRankingPageSchema.parse(schoolRanking)).toEqual(schoolRanking)
    expect(myRankSchema.parse(rankingMe)).toEqual(rankingMe)
    expect(publicSchoolsSchema.parse(schools)).toEqual(schools)
  })

  it('rejects a public row that still carries identity fields', () => {
    const leaky = { items: [{ ...ranking.items[0], username: 'hs_an' }], total: 1 }
    expect(studentRankingPageSchema.safeParse(leaky).success).toBe(false)
  })
})
```

`src/lib/ranking-params.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { parseRankingQuery, rankingHref, toBackendPeriod } from '@/lib/ranking-params'

describe('parseRankingQuery', () => {
  it('defaults to all time, page 1, no school', () => {
    expect(parseRankingQuery({})).toEqual({ period: 'all', page: 1 })
  })

  it('accepts valid values', () => {
    expect(parseRankingQuery({ period: 'week', page: '3', school: '4' })).toEqual({
      period: 'week',
      page: 3,
      schoolId: 4,
    })
  })

  it('falls back on anything else', () => {
    expect(parseRankingQuery({ period: 'day', page: '0', school: 'x' })).toEqual({ period: 'all', page: 1 })
    expect(parseRankingQuery({ page: '101' })).toEqual({ period: 'all', page: 1 })
    expect(parseRankingQuery({ page: '2.5', school: '-1' })).toEqual({ period: 'all', page: 1 })
    expect(parseRankingQuery({ period: ['month', 'week'] })).toEqual({ period: 'month', page: 1 })
  })
})

describe('toBackendPeriod', () => {
  it('maps week/month and omits all', () => {
    expect(toBackendPeriod('week')).toBe('WEEK')
    expect(toBackendPeriod('month')).toBe('MONTH')
    expect(toBackendPeriod('all')).toBeUndefined()
  })
})

describe('rankingHref', () => {
  it('omits defaults', () => {
    expect(rankingHref('/ranking', { period: 'all', page: 1 })).toBe('/ranking')
    expect(rankingHref('/ranking', { period: 'month', page: 2, schoolId: 3 })).toBe(
      '/ranking?period=month&school=3&page=2',
    )
  })
})
```

`src/lib/api/public.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import planets from '@/schemas/__fixtures__/planets.json'
import ranking from '@/schemas/__fixtures__/ranking.json'

vi.mock('server-only', () => ({}))

const { getPlanets, getStudentRanking } = await import('@/lib/api/public')

function respond(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('public API', () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns mapped data and asks Next to cache for 60 s', async () => {
    fetchMock.mockResolvedValue(respond(200, planets))
    const result = await getPlanets()
    expect(result.ok).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/planets\/public$/)
    expect(init.next).toEqual({ revalidate: 60 })
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it('builds the ranking query from validated values', async () => {
    fetchMock.mockResolvedValue(respond(200, ranking))
    await getStudentRanking({ period: 'week', page: 2, schoolId: 4 })
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/ranking\?page=2&limit=50&period=WEEK&schoolId=4$/)
  })

  it.each([
    ['a 500', () => fetchMock.mockResolvedValue(respond(500, { message: 'x' }))],
    ['a wrong shape', () => fetchMock.mockResolvedValue(respond(200, { nope: true }))],
    ['a network error', () => fetchMock.mockRejectedValue(new TypeError('fetch failed'))],
    ['a timeout', () => fetchMock.mockRejectedValue(new DOMException('timeout', 'TimeoutError'))],
  ])('returns { ok: false } and logs on %s', async (_label, arrange) => {
    arrange()
    await expect(getPlanets()).resolves.toEqual({ ok: false })
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[public-api] /planets/public'))
  })
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run schemas/planet.test.ts schemas/ranking.test.ts lib/ranking-params.test.ts lib/api/public.test.ts` → FAIL.

- [ ] **Step 3: Implement**

`src/schemas/planet.ts`:

```ts
import { z } from '@/lib/zod'

const planetSchema = z.object({
  slug: z.string(),
  name: z.string(),
  subtitle: z.string(),
  image: z.string(),
  linkUrl: z.string(),
  glowColor: z.string(),
  ribbonFrom: z.string(),
  ribbonTo: z.string(),
  sortOrder: z.number(),
})

export const planetsSchema = z.array(planetSchema)

export interface Planet {
  slug: string
  name: string
  description: string
  image: string
  glowColor: string
  ribbonFrom: string
  ribbonTo: string
  /** Where a click goes: `linkUrl`, else the level's exam list. */
  href: string
  /** True while the target route does not exist yet (`/challenges`: sub-project 5). */
  comingSoon: boolean
}

export function toPlanets(rows: z.output<typeof planetsSchema>): Planet[] {
  return [...rows]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => {
      const href = row.linkUrl || `/testlevels/${row.slug}`
      return {
        slug: row.slug,
        name: row.name,
        description: row.subtitle,
        image: row.image,
        glowColor: row.glowColor,
        ribbonFrom: row.ribbonFrom,
        ribbonTo: row.ribbonTo,
        href,
        comingSoon: href.startsWith('/challenges'),
      }
    })
}
```

`src/schemas/ranking.ts`:

```ts
import { z } from '@/lib/zod'

export const RANKING_PERIODS = ['week', 'month', 'all'] as const
export type RankingPeriod = (typeof RANKING_PERIODS)[number]

/** Public leaderboard row (backend M4): strict, so a returning identity field fails loudly. */
const studentRankSchema = z.strictObject({
  rank: z.number().int(),
  displayName: z.string(),
  schoolName: z.string(),
  totalPoints: z.number(),
})

const schoolRankSchema = z.object({
  rank: z.number().int(),
  schoolId: z.number().int(),
  name: z.string(),
  city: z.string(),
  studentCount: z.number().int(),
  totalPoints: z.number(),
})

export const studentRankingPageSchema = z.object({
  items: z.array(studentRankSchema),
  total: z.number().int(),
})
export const schoolRankingPageSchema = z.object({
  items: z.array(schoolRankSchema),
  total: z.number().int(),
})
export const myRankSchema = z.object({
  rank: z.number().int(),
  fullName: z.string(),
  schoolName: z.string(),
  totalPoints: z.number(),
})
export const publicSchoolsSchema = z.array(
  z.object({ id: z.number().int(), name: z.string(), city: z.string() }),
)

export type StudentRankingPage = z.output<typeof studentRankingPageSchema>
export type SchoolRankingPage = z.output<typeof schoolRankingPageSchema>
export type MyRank = z.output<typeof myRankSchema>
export type PublicSchool = z.output<typeof publicSchoolsSchema>[number]

export const RANKING_PAGE_SIZE = 50
```

`src/lib/ranking-params.ts`:

```ts
import { RANKING_PERIODS, type RankingPeriod } from '@/schemas/ranking'

export interface RankingQuery {
  period: RankingPeriod
  page: number
  schoolId?: number
}

type SearchParams = Record<string, string | string[] | undefined>

const MAX_PAGE = 100

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function positiveInt(value: string | undefined, max?: number): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined
  const n = Number(value)
  if (n < 1 || (max !== undefined && n > max)) return undefined
  return n
}

/**
 * Only known values reach the backend: arbitrary query strings would multiply uncached backend calls
 * from Vercel's shared IPs (spec §2.1).
 */
export function parseRankingQuery(searchParams: SearchParams): RankingQuery {
  const rawPeriod = first(searchParams.period)
  const period = RANKING_PERIODS.find((p) => p === rawPeriod) ?? 'all'
  const page = positiveInt(first(searchParams.page), MAX_PAGE) ?? 1
  const schoolId = positiveInt(first(searchParams.school))
  return schoolId ? { period, page, schoolId } : { period, page }
}

export function toBackendPeriod(period: RankingPeriod): 'WEEK' | 'MONTH' | undefined {
  if (period === 'week') return 'WEEK'
  if (period === 'month') return 'MONTH'
  return undefined
}

export function rankingHref(base: string, query: RankingQuery): string {
  const params = new URLSearchParams()
  if (query.period !== 'all') params.set('period', query.period)
  if (query.schoolId) params.set('school', String(query.schoolId))
  if (query.page > 1) params.set('page', String(query.page))
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
```

`src/lib/api/public-result.ts`:

```ts
/** Result of a server-side public fetch: it never throws, a failure renders an inline error state. */
export type PublicResult<T> = { ok: true; data: T } | { ok: false }
```

`src/lib/api/public.ts`:

```ts
import 'server-only'

import type { PublicResult } from '@/lib/api/public-result'
import { env } from '@/lib/env'
import { toBackendPeriod, type RankingQuery } from '@/lib/ranking-params'
import { z } from '@/lib/zod'
import { planetsSchema, toPlanets, type Planet } from '@/schemas/planet'
import {
  RANKING_PAGE_SIZE,
  publicSchoolsSchema,
  schoolRankingPageSchema,
  studentRankingPageSchema,
  type PublicSchool,
  type SchoolRankingPage,
  type StudentRankingPage,
} from '@/schemas/ranking'

const REVALIDATE_SECONDS = 60
const TIMEOUT_MS = 5000

/**
 * Public data for server components. Never throws: CI and Vercel build without a backend, and one
 * failing block must not take the page down (spec 2026-11-18-read-only-screens §2.1).
 */
async function getPublic<S extends z.ZodType>(
  path: string,
  schema: S,
): Promise<PublicResult<z.output<S>>> {
  try {
    const response = await fetch(`${env.API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) {
      console.error(`[public-api] ${path}: HTTP ${response.status}`)
      return { ok: false }
    }
    const parsed = schema.safeParse(await response.json())
    if (!parsed.success) {
      console.error(`[public-api] ${path}: unexpected response shape`)
      return { ok: false }
    }
    return { ok: true, data: parsed.data }
  } catch (error) {
    console.error(`[public-api] ${path}: ${error instanceof Error ? error.message : 'request failed'}`)
    return { ok: false }
  }
}

export async function getPlanets(): Promise<PublicResult<Planet[]>> {
  const result = await getPublic('/planets/public', planetsSchema)
  return result.ok ? { ok: true, data: toPlanets(result.data) } : result
}

export function getStudentRanking(query: RankingQuery): Promise<PublicResult<StudentRankingPage>> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(RANKING_PAGE_SIZE) })
  const period = toBackendPeriod(query.period)
  if (period) params.set('period', period)
  if (query.schoolId) params.set('schoolId', String(query.schoolId))
  return getPublic(`/ranking?${params}`, studentRankingPageSchema)
}

export function getSchoolRanking(
  query: Pick<RankingQuery, 'period' | 'page'>,
): Promise<PublicResult<SchoolRankingPage>> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(RANKING_PAGE_SIZE) })
  const period = toBackendPeriod(query.period)
  if (period) params.set('period', period)
  return getPublic(`/ranking/schools?${params}`, schoolRankingPageSchema)
}

export function getPublicSchools(): Promise<PublicResult<PublicSchool[]>> {
  return getPublic('/schools/public', publicSchoolsSchema)
}
```

In `src/lib/query-keys.ts`, replace the local `RankingPeriod` declaration with `import type { RankingPeriod } from '@/schemas/ranking'`.

- [ ] **Step 4: Run them**

Run: `npx vitest run schemas lib/ranking-params.test.ts lib/api` → PASS. `npx tsc --noEmit` → 0.
Note: the error log for the public test is `[public-api] /planets/public: …`; the path in the log is the request path including its query string for ranking calls.

---

### Task 4: Dashboard on `/planets/public`

**Files:**
- Modify: `src/app/(dashboard)/page.tsx`, `src/components/dashboard/dashboard-view.tsx` (and `planet-card.tsx` only if its props must change)
- Delete: `src/mocks/planets.json` if nothing else imports it (`grep -rn "mocks/planets" --include=*.ts --include=*.tsx .`; `mocks/mocks.test.ts` cases for it go too)
- Test: `src/components/dashboard/dashboard-view.test.tsx`

Behaviour (spec §3.1):
- `page.tsx` becomes `async`, calls `getPlanets()` and renders `<DashboardView planets={result.ok ? result.data : null} />`.
- `DashboardView` takes `planets: Planet[] | null`. `null` → render, in place of the planet map, a centred message `Tạm thời không tải được dữ liệu, vui lòng thử lại sau.` (white text, same container). An empty array → `Chưa có hành tinh nào.`
- Each planet renders as today, with `name`, `description`, `image` (still `next/image`; the real images are relative `/clone-assets/...` paths), the glow from `glowColor`, and the ribbon gradient as an inline style `background: linear-gradient(to right, ${ribbonFrom}, ${ribbonTo})` instead of the mock's class string.
- Clicking navigates to `planet.href`. A `comingSoon` planet is not clickable (no handler, `aria-disabled="true"`, `cursor-default`) and shows a small `Sắp ra mắt` badge. `CLICKABLE_PLANETS` and the mock import go.

- [ ] **Step 1: Write the failing test** (`src/components/dashboard/dashboard-view.test.tsx`)

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DashboardView } from '@/components/dashboard/dashboard-view'
import planets from '@/schemas/__fixtures__/planets.json'
import { planetsSchema, toPlanets } from '@/schemas/planet'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/' }))

const data = toPlanets(planetsSchema.parse(planets))

describe('DashboardView', () => {
  afterEach(() => {
    cleanup()
    push.mockReset()
  })

  it('renders every planet from the API', () => {
    render(<DashboardView planets={data} />)
    for (const planet of data) expect(screen.getAllByText(planet.name).length).toBeGreaterThan(0)
  })

  it('navigates to the level exam list', () => {
    render(<DashboardView planets={data} />)
    fireEvent.click(screen.getAllByText('Starters')[0])
    expect(push).toHaveBeenCalledWith('/testlevels/starters')
  })

  it('marks the IOE planet as coming soon and does not navigate', () => {
    render(<DashboardView planets={data} />)
    expect(screen.getByText('Sắp ra mắt')).toBeTruthy()
    fireEvent.click(screen.getAllByText('IOE')[0])
    expect(push).not.toHaveBeenCalled()
  })

  it('shows the error state when the API failed', () => {
    render(<DashboardView planets={null} />)
    expect(screen.getByText('Tạm thời không tải được dữ liệu, vui lòng thử lại sau.')).toBeTruthy()
  })
})
```

Read `dashboard-view.tsx` first: if it renders other children that need more mocks (e.g. `BingoOnboarding` using `localStorage`), mock those modules in the test rather than changing them. If the planet names in the fixture differ from `Starters`/`IOE`, use `data[1].name` / `data[0].name`.

- [ ] **Step 2:** Run `npx vitest run components/dashboard` → FAIL.
- [ ] **Step 3:** Implement the behaviour above.
- [ ] **Step 4:** Run `npx vitest run components/dashboard` → PASS; `npx tsc --noEmit` → 0.

---

### Task 5: Student and school rankings

**Files:**
- Modify: `src/app/(dashboard)/ranking/page.tsx`, `src/app/(dashboard)/school-ranking/page.tsx`, `src/components/ranking/ranking-view.tsx`, `ranking-table.tsx`, `school-ranking-view.tsx`, `school-ranking-table.tsx`
- Create: `src/lib/api/ranking-me.ts`, `src/hooks/use-my-rank.ts`, `src/components/ranking/my-rank-card.tsx`
- Delete: `src/mocks/ranking.json`, `src/mocks/school-ranking.ts`, `src/types/ranking.ts` (and its export in `types/index.ts`) once unused; matching cases in `mocks/mocks.test.ts`
- Test: `src/components/ranking/ranking-view.test.tsx`, `src/components/ranking/school-ranking-view.test.tsx`, `src/components/ranking/my-rank-card.test.tsx`

Behaviour (spec §3.2, §3.3):

Pages (Next 16: `searchParams` is a Promise):

```tsx
// src/app/(dashboard)/ranking/page.tsx (keep the existing metadata export)
import { RankingView } from '@/components/ranking'
import { getPublicSchools, getStudentRanking } from '@/lib/api/public'
import { parseRankingQuery } from '@/lib/ranking-params'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RankingPage({ searchParams }: PageProps): Promise<React.ReactElement> {
  const query = parseRankingQuery(await searchParams)
  const [ranking, schools] = await Promise.all([getStudentRanking(query), getPublicSchools()])
  return <RankingView query={query} ranking={ranking} schools={schools.ok ? schools.data : []} />
}
```

`school-ranking/page.tsx` does the same with `getSchoolRanking({ period: query.period, page: query.page })` and `<SchoolRankingView query={query} ranking={ranking} />`.

`RankingView` (`'use client'`) props: `{ query: RankingQuery; ranking: PublicResult<StudentRankingPage>; schools: PublicSchool[] }`.
- Period tabs `Tuần` / `Tháng` / `Tất cả` are `next/link`s to `rankingHref('/ranking', { ...query, period, page: 1 })`; the active one is styled as the current active tab.
- School select: first option `Tất cả trường` (value ''), then `schools` (`name`); on change `router.push(rankingHref('/ranking', { period: query.period, page: 1, schoolId }))`.
- Removed: day/year tabs, level, city and class-code filters, the location column.
- Table rows from `ranking.data.items`: `rank`, an avatar circle with the first letter of `displayName` (upper-case; no image), `displayName`, `schoolName`, `totalPoints`.
- Pagination when `ranking.data.total > RANKING_PAGE_SIZE`: `Trang trước` / `Trang sau` links (`rankingHref` with page ± 1), hidden at the ends, plus `Trang {page}/{pages}`.
- `ranking.ok === false` → the table area shows `Tạm thời không tải được dữ liệu, vui lòng thử lại sau.`; empty items → `Chưa có dữ liệu xếp hạng.`
- `<MyRankCard period={query.period} />` above the table.

`MyRankCard` (`'use client'`): guests (`useIsAuthenticated()` false) see a `next/link` `Đăng nhập để xem hạng của bạn` to `/login?redirect=%2Franking`. Signed in: `useMyRank(period)` → loading `Đang tải hạng của bạn…`; error `ApiError.message`; data `Hạng của bạn: #{rank} · {fullName} · {totalPoints} điểm`. No table row is highlighted.

`src/lib/api/ranking-me.ts`:

```ts
import { authFetch } from '@/lib/api-client'
import { parseOrThrow } from '@/lib/api/parse'
import { toBackendPeriod } from '@/lib/ranking-params'
import { myRankSchema, type MyRank, type RankingPeriod } from '@/schemas/ranking'

export async function fetchMyRank(period: RankingPeriod): Promise<MyRank> {
  const backendPeriod = toBackendPeriod(period)
  const path = backendPeriod ? `/ranking/me?period=${backendPeriod}` : '/ranking/me'
  return parseOrThrow(myRankSchema, await authFetch<unknown>(path), '/ranking/me')
}
```

`src/hooks/use-my-rank.ts`:

```ts
'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchMyRank } from '@/lib/api/ranking-me'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { RankingPeriod } from '@/schemas/ranking'

export function useMyRank(period: RankingPeriod) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.myRank(period),
    queryFn: () => fetchMyRank(period),
    enabled,
    retry: retryTransient,
  })
}
```

`SchoolRankingView` (`'use client'`) props `{ query: RankingQuery; ranking: PublicResult<SchoolRankingPage> }`: same period tabs (base `/school-ranking`), rows `rank`, `name`, `city`, `studentCount`, `totalPoints`, same pagination, error and empty states (`Chưa có dữ liệu xếp hạng.`). The level filter goes.

- [ ] **Step 1: Write the failing tests**

`src/components/ranking/ranking-view.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RankingView } from '@/components/ranking/ranking-view'
import ranking from '@/schemas/__fixtures__/ranking.json'
import schools from '@/schemas/__fixtures__/schools.json'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }), usePathname: () => '/ranking' }))
vi.mock('@/components/ranking/my-rank-card', () => ({ MyRankCard: () => null }))

const query = { period: 'all' as const, page: 1 }

describe('RankingView', () => {
  afterEach(() => {
    cleanup()
    push.mockReset()
  })

  it('renders the public rows without identity fields', () => {
    render(<RankingView query={query} ranking={{ ok: true, data: ranking }} schools={schools} />)
    expect(screen.getByText('Chi L.')).toBeTruthy()
    expect(screen.getAllByText('Trường Tiểu học Trần Phú').length).toBeGreaterThan(0)
    expect(screen.queryByText('hs_chi')).toBeNull()
  })

  it('links the period tabs and keeps the school filter', () => {
    render(
      <RankingView query={{ ...query, schoolId: 4 }} ranking={{ ok: true, data: ranking }} schools={schools} />,
    )
    expect(screen.getByText('Tuần').closest('a')?.getAttribute('href')).toBe('/ranking?period=week&school=4')
    expect(screen.queryByText('Ngày')).toBeNull()
  })

  it('pushes the school filter', () => {
    render(<RankingView query={query} ranking={{ ok: true, data: ranking }} schools={schools} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } })
    expect(push).toHaveBeenCalledWith('/ranking?school=3')
  })

  it('shows the error state', () => {
    render(<RankingView query={query} ranking={{ ok: false }} schools={[]} />)
    expect(screen.getByText('Tạm thời không tải được dữ liệu, vui lòng thử lại sau.')).toBeTruthy()
  })
})
```

`src/components/ranking/school-ranking-view.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SchoolRankingView } from '@/components/ranking/school-ranking-view'
import schoolRanking from '@/schemas/__fixtures__/ranking-schools.json'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/school-ranking',
}))

describe('SchoolRankingView', () => {
  afterEach(() => cleanup())

  it('renders school rows with city and student count', () => {
    render(<SchoolRankingView query={{ period: 'all', page: 1 }} ranking={{ ok: true, data: schoolRanking }} />)
    expect(screen.getByText('Trường Tiểu học Trần Phú')).toBeTruthy()
    expect(screen.getByText('Đà Nẵng')).toBeTruthy()
  })

  it('shows the empty state', () => {
    render(<SchoolRankingView query={{ period: 'all', page: 1 }} ranking={{ ok: true, data: { items: [], total: 0 } }} />)
    expect(screen.getByText('Chưa có dữ liệu xếp hạng.')).toBeTruthy()
  })
})
```

`src/components/ranking/my-rank-card.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MyRankCard } from '@/components/ranking/my-rank-card'
import rankingMe from '@/schemas/__fixtures__/ranking-me.json'

const state = { authenticated: false }
vi.mock('@/lib/private-query', () => ({ useIsAuthenticated: () => state.authenticated }))
vi.mock('@/hooks/use-my-rank', () => ({
  useMyRank: () => ({ data: state.authenticated ? rankingMe : undefined, isPending: false, error: null }),
}))

describe('MyRankCard', () => {
  afterEach(() => cleanup())

  it('invites a guest to log in', () => {
    state.authenticated = false
    render(<MyRankCard period="all" />)
    expect(screen.getByText('Đăng nhập để xem hạng của bạn').closest('a')?.getAttribute('href')).toBe(
      '/login?redirect=%2Franking',
    )
  })

  it('shows the signed-in student their own rank', () => {
    state.authenticated = true
    render(<MyRankCard period="all" />)
    expect(screen.getByText('Hạng của bạn: #5 · Nguyễn Minh An · 40 điểm')).toBeTruthy()
  })
})
```

- [ ] **Step 2:** `npx vitest run components/ranking` → FAIL.
- [ ] **Step 3:** Implement the behaviour above (read the current views first; keep their styling).
- [ ] **Step 4:** `npx vitest run components/ranking` → PASS; `npx tsc --noEmit` → 0; `grep -rn "mocks/ranking\|school-ranking\"\|SchoolRankingEntry" --include=*.ts --include=*.tsx .` shows no remaining mock use (the Topbar may link to `/school-ranking`, which is fine).

---

### Task 6: Notifications + Topbar badge

**Files:**
- Create: `src/schemas/notification.ts`, `src/lib/api/notifications.ts`, `src/hooks/use-notifications.ts`
- Modify: `src/types/notification.ts` (`time` → `createdAt`), `src/components/notifications/notifications-view.tsx`, `src/components/common/topbar.tsx` (bell button, lines ~340-356), `src/hooks/index.ts` (export the new hooks)
- Delete: `src/mocks/notifications.ts` (+ `mocks.test.ts` case) once unused
- Test: `src/schemas/notification.test.ts`, `src/components/notifications/notifications-view.test.tsx`, `src/components/common/unread-badge.test.tsx`

`src/types/notification.ts` becomes:

```ts
/** In-app notification shown on /notifications. */
export type NotificationType = 'result' | 'challenge' | 'reward' | 'event' | 'system'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  /** ISO time; the view formats it with formatRelativeTimeVi. */
  createdAt: string
  read: boolean
}
```

`src/schemas/notification.ts`:

```ts
import { z } from '@/lib/zod'
import type { Notification, NotificationType } from '@/types/notification'

export const notificationsSchema = z.array(
  z.object({
    id: z.number().int(),
    title: z.string(),
    message: z.string(),
    type: z.string(),
    createdAt: z.string(),
    isRead: z.boolean(),
  }),
)
export const unreadCountSchema = z.object({ count: z.number().int() })

const TYPE_MAP: Record<string, NotificationType> = { REWARD: 'reward', EVENT: 'event' }

export function toNotifications(rows: z.output<typeof notificationsSchema>): Notification[] {
  return rows.map((row) => ({
    id: row.id,
    type: TYPE_MAP[row.type] ?? 'system',
    title: row.title,
    message: row.message,
    createdAt: row.createdAt,
    read: row.isRead,
  }))
}
```

`src/lib/api/notifications.ts`:

```ts
import { authFetch } from '@/lib/api-client'
import { parseOrThrow } from '@/lib/api/parse'
import { notificationsSchema, toNotifications, unreadCountSchema } from '@/schemas/notification'
import type { Notification } from '@/types/notification'

export type NotificationFilter = 'all' | 'unread'

export async function fetchMyNotifications(filter: NotificationFilter): Promise<Notification[]> {
  const data = await authFetch<unknown>(`/notifications/my?filter=${filter}`)
  return toNotifications(parseOrThrow(notificationsSchema, data, '/notifications/my'))
}

export async function fetchUnreadCount(): Promise<number> {
  const data = await authFetch<unknown>('/notifications/unread-count')
  return parseOrThrow(unreadCountSchema, data, '/notifications/unread-count').count
}

export async function markNotificationRead(id: number): Promise<void> {
  await authFetch<unknown>(`/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsRead(): Promise<void> {
  await authFetch<unknown>('/notifications/read-all', { method: 'POST' })
}
```

`src/hooks/use-notifications.ts`:

```ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchMyNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationFilter,
} from '@/lib/api/notifications'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'

export function useMyNotifications(filter: NotificationFilter) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.notifications(filter),
    queryFn: () => fetchMyNotifications(filter),
    enabled,
    retry: retryTransient,
  })
}

export function useUnreadCount() {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    enabled,
    retry: retryTransient,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notificationsAll() }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notificationsAll() }),
  })
}
```

Behaviour:
- `NotificationsView`: the existing all/unread tabs drive `filter`. Loading → `Đang tải thông báo…`; error → the `ApiError.message` and a `Thử lại` button calling `refetch`; empty → `Không có thông báo nào.`; rows show title, message, `formatRelativeTimeVi(createdAt)`, unread styling from `read`. Clicking an unread row calls `markRead.mutate(id)`. The existing "mark all read" control calls `markAllRead.mutate()` and is disabled while pending or when nothing is unread. Remove the local read-state copy of the mock.
- Topbar: extract a small `UnreadBadge` component in `src/components/common/unread-badge.tsx` (`useUnreadCount()`; renders nothing unless authenticated and `count > 0`; shows `count` or `9+`; `aria-label="{count} thông báo chưa đọc"`), positioned absolutely on the bell icon wrapper (`relative` on the wrapper). Also replace that bell `<img onError>` dicebear fallback? No — leave the image and its fallback untouched (out of scope).

- [ ] **Step 1: Write the failing tests**

`src/schemas/notification.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import notifications from '@/schemas/__fixtures__/notifications.json'
import unread from '@/schemas/__fixtures__/unread.json'
import { notificationsSchema, toNotifications, unreadCountSchema } from '@/schemas/notification'

describe('notification schemas', () => {
  it('parse and map the real payload', () => {
    const result = toNotifications(notificationsSchema.parse(notifications))
    expect(result).toHaveLength(notifications.length)
    expect(result[0]).toEqual({
      id: notifications[0].id,
      type: 'reward',
      title: notifications[0].title,
      message: notifications[0].message,
      createdAt: notifications[0].createdAt,
      read: notifications[0].isRead,
    })
    expect(unreadCountSchema.parse(unread)).toEqual({ count: 2 })
  })

  it('maps ANNOUNCEMENT and unknown types to system', () => {
    const rows = notificationsSchema.parse(notifications)
    const types = toNotifications(rows.map((r) => ({ ...r, type: 'ANNOUNCEMENT' })))
    expect(new Set(types.map((t) => t.type))).toEqual(new Set(['system']))
  })
})
```

`src/components/notifications/notifications-view.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotificationsView } from '@/components/notifications/notifications-view'
import notifications from '@/schemas/__fixtures__/notifications.json'
import { notificationsSchema, toNotifications } from '@/schemas/notification'

const data = toNotifications(notificationsSchema.parse(notifications))
const markRead = vi.fn()
const markAll = vi.fn()
const query = { data, isPending: false, error: null as Error | null, refetch: vi.fn() }

vi.mock('@/hooks/use-notifications', () => ({
  useMyNotifications: () => query,
  useMarkNotificationRead: () => ({ mutate: markRead, isPending: false }),
  useMarkAllNotificationsRead: () => ({ mutate: markAll, isPending: false }),
}))

describe('NotificationsView', () => {
  afterEach(() => {
    cleanup()
    markRead.mockReset()
    markAll.mockReset()
    query.data = data
    query.error = null
  })

  it('renders the notifications from the API', () => {
    render(<NotificationsView />)
    for (const n of data) expect(screen.getByText(n.title)).toBeTruthy()
  })

  it('marks an unread notification as read when clicked', () => {
    render(<NotificationsView />)
    const unread = data.find((n) => !n.read)
    if (!unread) throw new Error('fixture has no unread notification')
    fireEvent.click(screen.getByText(unread.title))
    expect(markRead).toHaveBeenCalledWith(unread.id)
  })

  it('shows the error with a retry button', () => {
    query.data = undefined as unknown as typeof data
    query.error = new Error('Không thể kết nối máy chủ, vui lòng thử lại sau.')
    render(<NotificationsView />)
    fireEvent.click(screen.getByText('Thử lại'))
    expect(query.refetch).toHaveBeenCalled()
  })

  it('shows the empty state', () => {
    query.data = []
    render(<NotificationsView />)
    expect(screen.getByText('Không có thông báo nào.')).toBeTruthy()
  })
})
```

`src/components/common/unread-badge.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UnreadBadge } from '@/components/common/unread-badge'

const state = { count: 0 as number | undefined }
vi.mock('@/hooks/use-notifications', () => ({ useUnreadCount: () => ({ data: state.count }) }))

describe('UnreadBadge', () => {
  afterEach(() => cleanup())

  it('renders nothing without unread notifications', () => {
    state.count = 0
    const { container } = render(<UnreadBadge />)
    expect(container.textContent).toBe('')
  })

  it('shows the count, capped at 9+', () => {
    state.count = 2
    render(<UnreadBadge />)
    expect(screen.getByLabelText('2 thông báo chưa đọc').textContent).toBe('2')
    cleanup()
    state.count = 12
    render(<UnreadBadge />)
    expect(screen.getByLabelText('12 thông báo chưa đọc').textContent).toBe('9+')
  })
})
```

(`useUnreadCount` is disabled for guests, so `data` is `undefined` and the badge renders nothing — no separate auth check needed in the badge.)

- [ ] **Step 2:** `npx vitest run schemas/notification.test.ts components/notifications components/common/unread-badge.test.tsx` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS; `npx tsc --noEmit` → 0.

---

### Task 7: Tasks

**Files:**
- Create: `src/schemas/task.ts`, `src/lib/api/tasks.ts`, `src/hooks/use-tasks.ts`
- Modify: `src/types/task.ts`, `src/types/index.ts` (drop `TaskRewardType`), `src/components/tasks/tasks-view.tsx`, `src/hooks/index.ts`
- Delete: `src/mocks/tasks.ts` (+ test case) once unused
- Test: `src/schemas/task.test.ts`, `src/lib/api/tasks.test.ts`, `src/components/tasks/tasks-view.test.tsx`

`src/types/task.ts`:

```ts
/** A task on /tasks. */
export type TaskIcon =
  | 'exam'
  | 'trophy'
  | 'writing'
  | 'speaking'
  | 'vocab'
  | 'grammar'
  | 'challenge'
  | 'login'

export type TaskGroup = 'daily' | 'weekly' | 'achievement' | 'other'

export interface Task {
  id: number
  group: TaskGroup
  icon: TaskIcon
  title: string
  description: string
  progress: number
  target: number
  done: boolean
  claimed: boolean
  points: number
}
```

`src/schemas/task.ts`:

```ts
import { z } from '@/lib/zod'
import type { Task, TaskGroup, TaskIcon } from '@/types/task'

export const tasksSchema = z.array(
  z.object({
    id: z.number().int(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    targetCount: z.number().int(),
    actionType: z.string(),
    points: z.number(),
    currentCount: z.number().int(),
    completed: z.boolean(),
    claimed: z.boolean(),
  }),
)
export const claimResultSchema = z.object({ success: z.literal(true), pointsAwarded: z.number() })

const GROUPS: Record<string, TaskGroup> = { DAILY: 'daily', WEEKLY: 'weekly', ACHIEVEMENT: 'achievement' }
const ICONS: Record<string, TaskIcon> = {
  COMPLETE_EXAM: 'exam',
  SCORE_90: 'trophy',
  COMPLETE_SPEAKING: 'speaking',
  COMPLETE_WRITING: 'writing',
  PLAY_CHALLENGE: 'challenge',
}

export const TASK_GROUP_LABELS: Record<TaskGroup, string> = {
  daily: 'Nhiệm vụ hằng ngày',
  weekly: 'Nhiệm vụ hằng tuần',
  achievement: 'Thành tích',
  other: 'Nhiệm vụ khác',
}

export function toTasks(rows: z.output<typeof tasksSchema>): Task[] {
  return rows.map((row) => ({
    id: row.id,
    group: GROUPS[row.category] ?? 'other',
    icon: ICONS[row.actionType] ?? 'exam',
    title: row.title,
    description: row.description,
    progress: row.currentCount,
    target: row.targetCount,
    done: row.completed,
    claimed: row.claimed,
    points: row.points,
  }))
}
```

`src/lib/api/tasks.ts`:

```ts
import { ApiError, GENERIC_ERROR_MESSAGE, authFetch } from '@/lib/api-client'
import { parseOrThrow } from '@/lib/api/parse'
import { claimResultSchema, tasksSchema, toTasks } from '@/schemas/task'
import type { Task } from '@/types/task'

export async function fetchMyTasks(): Promise<Task[]> {
  return toTasks(parseOrThrow(tasksSchema, await authFetch<unknown>('/tasks/my'), '/tasks/my'))
}

export async function claimTask(id: number): Promise<number> {
  const data = await authFetch<unknown>(`/tasks/${id}/claim`, { method: 'POST' })
  return parseOrThrow(claimResultSchema, data, '/tasks/:id/claim').pointsAwarded
}

const CLAIM_ERRORS: Record<number, string> = {
  400: 'Chưa hoàn thành nhiệm vụ.',
  404: 'Nhiệm vụ không còn tồn tại.',
  409: 'Bạn đã nhận thưởng nhiệm vụ này.',
}

export function claimErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return CLAIM_ERRORS[error.status] ?? error.message
  return GENERIC_ERROR_MESSAGE
}
```

`src/hooks/use-tasks.ts`:

```ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { claimTask, fetchMyTasks } from '@/lib/api/tasks'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'

export function useMyTasks() {
  const enabled = useIsAuthenticated()
  return useQuery({ queryKey: queryKeys.tasks(), queryFn: fetchMyTasks, enabled, retry: retryTransient })
}

export function useClaimTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: claimTask,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks() }),
  })
}
```

Behaviour (spec §3.5): groups in the order daily, weekly, achievement, other, each under its `TASK_GROUP_LABELS` heading, empty groups hidden. Per task: icon from `icon` (existing icon mapping in the view), title, description, a progress bar `progress/target` (cap the bar at 100 %), reward `{points} điểm`. Button: `Nhận thưởng` (enabled) when `done && !claimed`; `Đã nhận` (disabled) when `claimed`; `Chưa hoàn thành` (disabled) otherwise. Clicking calls `claim.mutate(id, { onError: (e) => setError(claimErrorMessage(e)), onSuccess: (points) => setNotice(\`+${points} điểm\`) })`; show the error or notice above the list. Loading `Đang tải nhiệm vụ…`; error message + `Thử lại`; empty `Chưa có nhiệm vụ nào.` Remove the hard-coded coin/diamond balances (`tasks-view.tsx:63-72`) and every `rewardType` use.

- [ ] **Step 1: Write the failing tests**

`src/schemas/task.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import tasks from '@/schemas/__fixtures__/tasks.json'
import { tasksSchema, toTasks } from '@/schemas/task'

describe('task schemas', () => {
  it('parse and map the real payload', () => {
    const result = toTasks(tasksSchema.parse(tasks))
    expect(result).toHaveLength(tasks.length)
    expect(result[0]).toEqual({
      id: 7,
      group: 'achievement',
      icon: 'exam',
      title: tasks[0].title,
      description: tasks[0].description,
      progress: 3,
      target: 20,
      done: false,
      claimed: false,
      points: 200,
    })
    expect(new Set(result.map((t) => t.group))).toEqual(new Set(['achievement', 'daily', 'weekly']))
  })

  it('maps unknown categories and actions to safe defaults', () => {
    const [row] = tasksSchema.parse(tasks)
    expect(toTasks([{ ...row, category: 'X', actionType: 'Y' }])[0]).toMatchObject({ group: 'other', icon: 'exam' })
  })
})
```

`src/lib/api/tasks.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { ApiError } from '@/lib/api-client'
import { claimErrorMessage } from '@/lib/api/tasks'

describe('claimErrorMessage', () => {
  it.each([
    [400, 'Chưa hoàn thành nhiệm vụ.'],
    [404, 'Nhiệm vụ không còn tồn tại.'],
    [409, 'Bạn đã nhận thưởng nhiệm vụ này.'],
  ])('%i -> %s', (status, message) => {
    expect(claimErrorMessage(new ApiError('x', status, null, true))).toBe(message)
  })

  it('falls back to the ApiError message, then the generic one', () => {
    expect(claimErrorMessage(new ApiError('Máy chủ bận', 503))).toBe('Máy chủ bận')
    expect(claimErrorMessage(new Error('x'))).toBe('Không thể kết nối máy chủ, vui lòng thử lại sau.')
  })
})
```

`src/components/tasks/tasks-view.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TasksView } from '@/components/tasks/tasks-view'
import tasks from '@/schemas/__fixtures__/tasks.json'
import { tasksSchema, toTasks } from '@/schemas/task'

const base = toTasks(tasksSchema.parse(tasks))
const claimable = { ...base[1], done: true, claimed: false }
const claimed = { ...base[2], done: true, claimed: true }
const data = [base[0], claimable, claimed, ...base.slice(3)]
const mutate = vi.fn()

vi.mock('@/hooks/use-tasks', () => ({
  useMyTasks: () => ({ data, isPending: false, error: null, refetch: vi.fn() }),
  useClaimTask: () => ({ mutate, isPending: false }),
}))

describe('TasksView', () => {
  afterEach(() => {
    cleanup()
    mutate.mockReset()
  })

  it('groups tasks under their headings and shows points', () => {
    render(<TasksView />)
    expect(screen.getByText('Thành tích')).toBeTruthy()
    expect(screen.getByText('Nhiệm vụ hằng ngày')).toBeTruthy()
    expect(screen.getAllByText(`${base[0].points} điểm`).length).toBeGreaterThan(0)
    expect(screen.queryByText('120')).toBeNull()
  })

  it('claims a completed task', () => {
    render(<TasksView />)
    fireEvent.click(screen.getByText('Nhận thưởng'))
    expect(mutate).toHaveBeenCalledWith(claimable.id, expect.any(Object))
  })

  it('disables claimed tasks', () => {
    render(<TasksView />)
    expect((screen.getByText('Đã nhận').closest('button') as HTMLButtonElement).disabled).toBe(true)
  })
})
```

- [ ] **Step 2:** `npx vitest run schemas/task.test.ts lib/api/tasks.test.ts components/tasks` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS; `npx tsc --noEmit` → 0.

---

### Task 8: History

**Files:**
- Create: `src/schemas/history.ts`, `src/lib/api/history.ts`, `src/hooks/use-history.ts`
- Modify: `src/lib/query-keys.ts` (import `HistoryQuery`), `src/components/history/history-view.tsx`, `src/hooks/index.ts`
- Delete: `src/mocks/history.json` (+ test case) once unused
- Test: `src/schemas/history.test.ts`, `src/components/history/history-view.test.tsx`

`src/schemas/history.ts`:

```ts
import { z } from '@/lib/zod'

export const historySchema = z.array(
  z.object({
    id: z.string(),
    kind: z.string(),
    title: z.string(),
    levelSlug: z.string(),
    score: z.number(),
    maxScore: z.number(),
    status: z.string(),
    correctCount: z.number().int(),
    totalQuestions: z.number().int(),
    timeSpentSec: z.number().int(),
    createdAt: z.string(),
    detailUrl: z.string(),
  }),
)
export type HistoryItem = z.output<typeof historySchema>[number]

export type HistoryKind = 'EXAM' | 'WRITING' | 'SPEAKING'
export type HistoryStatus = 'passed' | 'failed' | 'pending' | 'graded'

/** Server-side filters of GET /history/my. Omitted keys mean "all". */
export interface HistoryQuery {
  kind?: HistoryKind
  status?: HistoryStatus
  levelSlug?: string
}

export const HISTORY_KIND_LABELS: Record<HistoryKind, string> = {
  EXAM: 'Thi',
  WRITING: 'Viết',
  SPEAKING: 'Nói',
}
export const HISTORY_STATUS_LABELS: Record<HistoryStatus, string> = {
  passed: 'Đạt',
  failed: 'Chưa đạt',
  pending: 'Chờ chấm',
  graded: 'Đã chấm',
}

export function kindLabel(kind: string): string {
  return HISTORY_KIND_LABELS[kind as HistoryKind] ?? kind
}
export function statusLabel(status: string): string {
  return HISTORY_STATUS_LABELS[status as HistoryStatus] ?? status
}
```

`src/lib/api/history.ts`:

```ts
import { authFetch } from '@/lib/api-client'
import { parseOrThrow } from '@/lib/api/parse'
import { historySchema, type HistoryItem, type HistoryQuery } from '@/schemas/history'

export async function fetchMyHistory(query: HistoryQuery): Promise<HistoryItem[]> {
  const params = new URLSearchParams()
  if (query.kind) params.set('kind', query.kind)
  if (query.status) params.set('status', query.status)
  if (query.levelSlug) params.set('levelSlug', query.levelSlug)
  const qs = params.toString()
  const data = await authFetch<unknown>(qs ? `/history/my?${qs}` : '/history/my')
  return parseOrThrow(historySchema, data, '/history/my')
}
```

`src/hooks/use-history.ts`:

```ts
'use client'

import { useQuery } from '@tanstack/react-query'

import { fetchMyHistory } from '@/lib/api/history'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { HistoryQuery } from '@/schemas/history'

export function useMyHistory(query: HistoryQuery) {
  const enabled = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.history(query),
    queryFn: () => fetchMyHistory(query),
    enabled,
    retry: retryTransient,
  })
}
```

Behaviour (spec §3.6): kind tabs `Tất cả` / `Thi` / `Viết` / `Nói` (→ `kind`), a status select (`Tất cả trạng thái` + the four labels), a level select (`Tất cả cấp độ` + `LEVEL_OPTIONS`), and the existing search box filtering `title` in the browser (case-insensitive, trimmed). Columns: `formatDateTimeVi(createdAt)`, `levelLabel(levelSlug)`, `kindLabel(kind)`, `title`, `{score}/{maxScore}`, `{correctCount}/{totalQuestions}`, `statusLabel(status)`. No detail link. Remove `isTrialMode` and every trial branch, the Listening/Reading skill filters and the "Đang làm" status. Loading `Đang tải lịch sử…`; error + `Thử lại`; empty (after filters) `Chưa có bài làm nào.`

- [ ] **Step 1: Write the failing tests**

`src/schemas/history.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import history from '@/schemas/__fixtures__/history.json'
import { historySchema, kindLabel, statusLabel } from '@/schemas/history'

describe('history schema', () => {
  it('parses the real payload', () => {
    expect(historySchema.parse(history)).toEqual(history)
  })

  it('labels kinds and statuses, passing unknown values through', () => {
    expect(kindLabel('EXAM')).toBe('Thi')
    expect(statusLabel('pending')).toBe('Chờ chấm')
    expect(statusLabel('archived')).toBe('archived')
  })
})
```

`src/components/history/history-view.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HistoryView } from '@/components/history/history-view'
import history from '@/schemas/__fixtures__/history.json'

const calls: unknown[] = []
vi.mock('@/hooks/use-history', () => ({
  useMyHistory: (query: unknown) => {
    calls.push(query)
    return { data: history, isPending: false, error: null, refetch: vi.fn() }
  },
}))

describe('HistoryView', () => {
  afterEach(() => {
    cleanup()
    calls.length = 0
  })

  it('renders the attempts with labels', () => {
    render(<HistoryView />)
    expect(screen.getByText(history[0].title)).toBeTruthy()
    expect(screen.getAllByText('Movers (A1)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Chờ chấm').length).toBeGreaterThan(0)
    expect(screen.getByText('17/11/2026 09:13')).toBeTruthy()
  })

  it('sends the kind filter to the server', () => {
    render(<HistoryView />)
    fireEvent.click(screen.getByText('Viết'))
    expect(calls.at(-1)).toEqual({ kind: 'WRITING' })
  })

  it('filters by title in the browser', () => {
    render(<HistoryView />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'không có' } })
    expect(screen.getByText('Chưa có bài làm nào.')).toBeTruthy()
  })
})
```

(If the search input is not `type="search"`, make it one — it is a search box. `17/11/2026 09:13` is `history[0].createdAt` in Vietnam time; if the fixture order differs, compute it with `formatDateTimeVi(history[0].createdAt)`.)

- [ ] **Step 2:** `npx vitest run schemas/history.test.ts components/history` → FAIL.
- [ ] **Step 3:** Implement; in `lib/query-keys.ts` replace the local `HistoryQuery` with `import type { HistoryQuery } from '@/schemas/history'`.
- [ ] **Step 4:** Same command → PASS; `npx tsc --noEmit` → 0.

---

### Task 9: Notebook

**Files:**
- Create: `src/schemas/notebook.ts`, `src/lib/api/notebook.ts`, `src/hooks/use-notebook.ts`
- Modify: `src/components/notebook/notebook-view.tsx`, `src/components/notebook/notebook-data.ts` (drop `MOCK_WORDS`; delete the file if nothing else is left in it), `src/hooks/index.ts`
- Test: `src/schemas/notebook.test.ts`, `src/components/notebook/notebook-view.test.tsx`

`src/schemas/notebook.ts`:

```ts
import { z } from '@/lib/zod'

export const notebookSchema = z.array(
  z.object({
    id: z.number().int(),
    isFavorite: z.boolean(),
    memorized: z.boolean(),
    notes: z.string().nullable(),
    vocab: z.object({
      word: z.string(),
      ipa: z.string(),
      type: z.string(),
      meaningVi: z.string(),
      exampleEn: z.string().nullable(),
      exampleVi: z.string().nullable(),
      audioUrl: z.string(),
      level: z.string(),
    }),
  }),
)

export interface NotebookWord {
  id: number
  word: string
  ipa: string
  type: string
  meaningVi: string
  exampleEn: string | null
  exampleVi: string | null
  /** null when the backend has no recording (it sends ''). */
  audioUrl: string | null
  level: string
  isFavorite: boolean
  memorized: boolean
}

export function toNotebookWords(rows: z.output<typeof notebookSchema>): NotebookWord[] {
  return rows.map((row) => ({
    id: row.id,
    word: row.vocab.word,
    ipa: row.vocab.ipa,
    type: row.vocab.type,
    meaningVi: row.vocab.meaningVi,
    exampleEn: row.vocab.exampleEn || null,
    exampleVi: row.vocab.exampleVi || null,
    audioUrl: row.vocab.audioUrl || null,
    level: row.vocab.level,
    isFavorite: row.isFavorite,
    memorized: row.memorized,
  }))
}

export type NotebookPatch = Partial<Pick<NotebookWord, 'isFavorite' | 'memorized'>>
```

`src/lib/api/notebook.ts`:

```ts
import { authFetch } from '@/lib/api-client'
import { parseOrThrow } from '@/lib/api/parse'
import { notebookSchema, toNotebookWords, type NotebookPatch, type NotebookWord } from '@/schemas/notebook'

export async function fetchMyNotebook(): Promise<NotebookWord[]> {
  return toNotebookWords(parseOrThrow(notebookSchema, await authFetch<unknown>('/notebook/my'), '/notebook/my'))
}

export async function updateNotebookEntry(id: number, patch: NotebookPatch): Promise<void> {
  await authFetch<unknown>(`/notebook/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function deleteNotebookEntry(id: number): Promise<void> {
  await authFetch<unknown>(`/notebook/${id}`, { method: 'DELETE' })
}
```

`src/hooks/use-notebook.ts`:

```ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteNotebookEntry, fetchMyNotebook, updateNotebookEntry } from '@/lib/api/notebook'
import { retryTransient, useIsAuthenticated } from '@/lib/private-query'
import { queryKeys } from '@/lib/query-keys'
import type { NotebookPatch } from '@/schemas/notebook'

export function useMyNotebook() {
  const enabled = useIsAuthenticated()
  return useQuery({ queryKey: queryKeys.notebook(), queryFn: fetchMyNotebook, enabled, retry: retryTransient })
}

export function useUpdateNotebookEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: NotebookPatch }) => updateNotebookEntry(id, patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notebook() }),
  })
}

export function useDeleteNotebookEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteNotebookEntry,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.notebook() }),
  })
}
```

Behaviour (spec §3.7): tabs `Từ vựng` (all words), `Đánh dấu sao` (`isFavorite`), `Ngữ pháp` → a panel `Ngữ pháp sắp có. Hãy quay lại sau nhé!`. Search filters `word` and `meaningVi` (case-insensitive) in the browser; level select `Tất cả cấp độ` + `LEVEL_OPTIONS`. Card: word, ipa, type, meaningVi, examples only when present, `levelLabel(level)`. Star toggle → `update.mutate({ id, patch: { isFavorite: !isFavorite } })`; a `Đã thuộc` toggle → `{ memorized: !memorized }`; `Xoá` → `window.confirm('Xoá từ này khỏi sổ tay?')` then `remove.mutate(id)`. Pronunciation: `audioUrl` → `new Audio(audioUrl).play()`, otherwise the existing `speechSynthesis` code. Keep the flip-card interaction. Loading `Đang tải sổ tay…`; error + `Thử lại`; no words at all → `Sổ tay trống. Từ bạn tra trong lúc làm bài sẽ xuất hiện ở đây.`; words but none after filters → `Không tìm thấy từ phù hợp.` Remove the local `starredWords` state seeded from the mock.

- [ ] **Step 1: Write the failing tests**

`src/schemas/notebook.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

import notebook from '@/schemas/__fixtures__/notebook.json'
import { notebookSchema, toNotebookWords } from '@/schemas/notebook'

describe('notebook schema', () => {
  it('parses and flattens the real payload', () => {
    const [first] = toNotebookWords(notebookSchema.parse(notebook))
    expect(first).toEqual({
      id: 3,
      word: 'curious',
      ipa: '/ˈkjʊəriəs/',
      type: 'adj',
      meaningVi: notebook[0].vocab.meaningVi,
      exampleEn: notebook[0].vocab.exampleEn,
      exampleVi: notebook[0].vocab.exampleVi,
      audioUrl: null,
      level: 'starters',
      isFavorite: false,
      memorized: true,
    })
  })
})
```

`src/components/notebook/notebook-view.test.tsx`:

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NotebookView } from '@/components/notebook/notebook-view'
import notebook from '@/schemas/__fixtures__/notebook.json'
import { notebookSchema, toNotebookWords } from '@/schemas/notebook'

const words = toNotebookWords(notebookSchema.parse(notebook))
const update = vi.fn()
const remove = vi.fn()
const query = { data: words, isPending: false, error: null, refetch: vi.fn() }

vi.mock('@/hooks/use-notebook', () => ({
  useMyNotebook: () => query,
  useUpdateNotebookEntry: () => ({ mutate: update, isPending: false }),
  useDeleteNotebookEntry: () => ({ mutate: remove, isPending: false }),
}))

describe('NotebookView', () => {
  afterEach(() => {
    cleanup()
    update.mockReset()
    remove.mockReset()
    query.data = words
    vi.restoreAllMocks()
  })

  it('renders the student words', () => {
    render(<NotebookView />)
    for (const w of words) expect(screen.getAllByText(w.word).length).toBeGreaterThan(0)
  })

  it('shows grammar as coming soon', () => {
    render(<NotebookView />)
    fireEvent.click(screen.getByText('Ngữ pháp'))
    expect(screen.getByText('Ngữ pháp sắp có. Hãy quay lại sau nhé!')).toBeTruthy()
  })

  it('deletes a word after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<NotebookView />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Xoá' })[0])
    expect(remove).toHaveBeenCalledWith(words[0].id)
  })

  it('shows the empty notebook message', () => {
    query.data = []
    render(<NotebookView />)
    expect(screen.getByText('Sổ tay trống. Từ bạn tra trong lúc làm bài sẽ xuất hiện ở đây.')).toBeTruthy()
  })
})
```

(The delete control must have the accessible name `Xoá` — visible text or `aria-label`. If a card's buttons sit on the back face of the flip card, they still render in the DOM; if not, flip the card in the test first.)

- [ ] **Step 2:** `npx vitest run schemas/notebook.test.ts components/notebook` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Same command → PASS; `npx tsc --noEmit` → 0.

---

### Task 10: Cleanup, docs, full verification

**Files:**
- Modify: `src/mocks/mocks.test.ts` (only cases for files that still exist), `src/types/index.ts`, `.claude/ARCHITECTURE.md` (data layer section), `docs/01-architecture.md` (same), `AGENTS.md` "Project" paragraph (which domains are now real)

- [ ] **Step 1:** `grep -rn "@/mocks/\(planets\|ranking\|school-ranking\|notifications\|tasks\|history\)\|MOCK_WORDS" --include=*.ts --include=*.tsx .` → no results outside deleted files. Delete the six mock files if still present. `src/mocks/testlevels.json`, `checkpoints.json`, `exam-*.json`, `writing.ts`, `speaking.ts` stay (sub-projects 3 and 4).
- [ ] **Step 2: Docs.** In `.claude/ARCHITECTURE.md` and `docs/01-architecture.md` add a "Data layer" subsection: public data via `lib/api/public.ts` (`server-only`, `revalidate: 60`, never throws, `PublicResult`), private data via `lib/api/<domain>.ts` + `schemas/<domain>.ts` + `hooks/use-<domain>.ts`, keys rooted at `'me'` in `lib/query-keys.ts`, `PrivateDataCleanup`, fixtures in `schemas/__fixtures__` captured from the real backend (recapture when the contract changes). In `AGENTS.md`, the sentence "Today only authentication talks to the backend" becomes: authentication, dashboard, rankings, notifications, tasks, history and notebook use the API; exams, writing/speaking, challenges and admin still read `src/mocks/`, `localStorage` or page constants.
- [ ] **Step 3: Tier 1.** `npx tsc --noEmit` (0), `npm run lint` (≤ 8 known errors, none in new files), `npm test` (all green; report the counts).
- [ ] **Step 4: Build without a backend.** Stop nothing; just make sure `http://localhost:3005` is not what the build reaches by running `NEXT_PUBLIC_API_URL=http://127.0.0.1:9/api npm run build` → succeeds; the log shows `[public-api]` errors for the prerendered public pages and no crash.
- [ ] **Step 5: Tier 2 with the real backend** (the controller provides a running backend on 3005 and confirms the web port). Over HTTP (curl the SSR HTML) for `/`, `/ranking`, `/ranking?period=week`, `/ranking?school=2`, `/school-ranking`: status 200 and the real names (`An N.`, `Trường Tiểu học Kim Đồng`, `Đà Nẵng`) in the HTML. Private screens need a browser: report "browser behaviour not verified" for them; the controller/owner checks them.
