# Verification Rules: Two Tiers

Automated checks prove that code *runs*; they do not prove the system *works*. Each tier catches a
kind of failure the tier below cannot see.

Tier 3 (proxy/nginx) does not apply: there is no proxy layer in this repo.

Run every npm command from `src/`.

## Tier 1: Automated checks (always required)

```bash
cd src
npx tsc --noEmit
npm run lint
npm test
```

Compare the results against the known baseline in `docs/03-known-issues.md` (missing mocks make
`tsc` and `build` fail, and lint has pre-existing errors). A change must not add to the baseline;
do not "fix" the baseline by inventing data.

Catches: wrong logic, type errors, regressions. Does **not** catch: wrong configuration, runtime
behavior of a route, SSR/hydration problems, or a mismatch between this app and the backend contract.

## Tier 2: Exercise the running app (required when you touch a route, UI, or API call)

After changing a page, component, or data flow you must **run the app and drive the affected
route**, not only run the checks.

Check port 3000 first:

```bash
netstat -ano | grep ":3000 " | grep LISTENING
```

If it is busy, do not kill it: use that server only if the controller's prompt says to use it,
otherwise report. Otherwise start the app in the background and note the port Next prints:

```bash
cd src
npm run dev
```

Stop only the server you started.

Open the route in a browser (or drive it with Playwright) and check: the page renders, the browser
console has no new errors or warnings beyond those listed in `docs/03-known-issues.md`, and the
interaction you changed actually behaves as specified. Subagents without a browser tool verify over
HTTP instead (curl the route, check the status and the SSR HTML) and must report "browser behaviour
not verified"; browser checks are done by the main session or the owner.

When the change touches `src/lib/api-client.ts`, auth hooks, or anything that calls the backend,
run the sibling repo `../luyenthiao.com-Backend` (branch `develop`, run command per its README; it listens on port 3005, so set `NEXT_PUBLIC_API_URL=http://localhost:3005/api` in `src/.env.local`) and call it **through the app**: log in, trigger the
request, and read the real payload. This is the only way to catch a contract mismatch: a `zod`
field declared required that the backend does not return, an error code the client does not
handle, or a header that is missing.

When the change touches backend calls, also verify that the real response has exactly the fields the spec requires (none missing, none extra) and the HTTP status and error codes the spec states.

If the backend cannot be run, say so explicitly ("not verified against the real backend") instead
of guessing the outcome.

## General principles

- **If you did not run it, do not say it is done.** State which items were not verified instead of
  guessing the result.
- **Read the real payload, do not trust the docs.** Documentation describes intent; the payload is
  the truth.
- Reading code, configuration, or the route list **does not replace** running it. They can look
  correct while runtime behavior is wrong.
