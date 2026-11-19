/** Result of a server-side public fetch: it never throws, a failure renders an inline error state. */
export type PublicResult<T> = { ok: true; data: T } | { ok: false }
