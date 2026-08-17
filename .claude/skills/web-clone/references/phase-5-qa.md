# Phase 5 — QA (dual: machine gates + human eye)

Two stages, in order. Machine first (cheap, objective), human second (the 80% judgement).

## Stage 1 — Hard gates (all must be green, no exceptions)

```bash
bun run lint                                              # includes jsx-a11y
bunx tsc --noEmit                                         # strict clean
bun run test                                              # vitest suite
bun run .claude/skills/web-clone/scripts/gates.ts         # class A structural bans
```

A red gate is never silenced or downgraded — the code is redone the repo-idiomatic way (see `failure-gates.md`).

## Stage 2 — Interaction sweep on the CLONE (MCP)

Run `bun run dev` and click through the built screens the same way Phase 1 swept the original — scroll, then click, then hover. Verify against each spec's declared interactions:

- forms: validation errors appear (react-hook-form + zod), submit flows through the mock layer
- state changes (tabs, modals, menus, filters) behave as declared
- hover/press/selected states exist
- Vietnamese copy matches the captures verbatim

Anything undeclared that the original does = a spec gap → back to Phase 2 for that section (small loop, not a full restart).

## Stage 3 — Side-by-side album (the 80% verdict)

Build `_webclone/album/index.html`: for every screen × viewport, the original capture next to a fresh screenshot of the clone (same viewport). The HUMAN makes the 80% call by eye — there is no numeric diff, by design. Record each verdict in the album (pass / needs-work + one-line reason).

## Definition of done — per screen checklist

- [ ] lint / tsc / test / gates.ts green
- [ ] spec satisfied, including declared state & validation
- [ ] mock data wired through Zod-validated React Query hooks
- [ ] interaction sweep findings match spec declarations
- [ ] album entry exists; human 80% verdict = pass
- [ ] no credentials anywhere in repo, code, logs, or album

## Two-stage review (repo CLAUDE.md)

Before handing over: (1) **spec compliance** — does it do what the approved Design Model says; (2) **code quality** — is it clean under `coding.md`. Both reviews pass → the screen is done.

## Run report

Write `_webclone/run-report.md`: screens built, gates status, album verdicts, spec gaps found and how resolved, deferred players (v1.1). This is what the user reads first.
