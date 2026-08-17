---
name: web-clone
description: Clone the frontend of a live website (primary target exam.flyer.us) into this repo's stack — 80% visual fidelity, 100% clean idiomatic code. Use when asked to clone, copy, rebuild, or replicate any website or screen from a URL into this project. Covers login-gated recon, design-model specs, parallel section builds in worktrees, and hard quality gates.
---

# Web Clone — the 80/100 factory

Rebuilds a live site onto THIS repo's stack (Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui, Bun). The deliverable is a **twin clone**:

- **~80% visual fidelity** to the original — close enough that nobody double-takes, and no closer.
- **100% code that reads like this repo wrote it** — passes `.claude/rules/coding.md` and every gate below.

Most clone tooling optimizes for pixels. This skill optimizes for **code idiomaticity** — the visual bar exists only to prove the clone is faithful, not to be pixel-perfect.

## Non-negotiables (hold in every phase)

1. **80/100 rule.** Never trade code cleanliness for pixels. Prefer shadcn/ui primitives over copied custom CSS. There is no pixel-diff in this skill — by design.
2. **Machine over promises.** If a rule can be machine-checked (lint, `tsc`, a11y, structural bans), it is a HARD GATE enforced by `scripts/gates.ts` — never advice. "I followed the rules" is not a state; a green terminal is.
3. **Spec before code.** No section is built without an approved spec (Phase 2). A spec that doesn't declare state/validation/interactions is rejected — that is failure class B.
4. **Credentials live in `.env` only** (already git-ignored). Never in code, logs, specs, file names, commits, or chat output. Runtime reads `CLONE_TARGET_URL`, `CLONE_LOGIN_PHONE`, `CLONE_LOGIN_PASSWORD`.
5. **Assets are copied verbatim** into `public/clone-assets/` — no re-creation, no "improvements", no hotlinking.
6. **Disease prevention first.** Every builder reads `references/failure-gates.md` before writing a line. The 3 failure classes documented there were real failures; the gates are not optional.

## Pipeline — strictly in order, one phase at a time

Load each phase's reference only when that phase starts (keep context lean):

| Phase | Purpose | Reference |
|---|---|---|
| 0 Setup | deps, MCP, codegraph, `.env`, smoke test | `references/phase-0-setup.md` |
| 1 Recon | hybrid eye: MCP explores + logs in; `capture.ts` bulk-captures 3 viewports; asset harvest | `references/phase-1-recon.md` |
| 2 Design Model | `design-tokens.json` + one spec per section (3-principles chunking); **human review point** | `references/phase-2-design-model.md` |
| 3 Build | foundation-first; N builders in isolated worktrees, one chunk each | `references/phase-3-build.md` |
| 4 Assembly | merge worktrees, wire routes / ROUTES / sitemap / barrels | `references/phase-4-assembly.md` |
| 5 QA | hard gates green + interaction sweep + side-by-side album (human eye) | `references/phase-5-qa.md` |

## Work directory layout

```
_webclone/
  captures/        # screenshots, HTML snapshots, screen inventory  (git-ignored)
  design-model/    # tokens.json + section specs + mocks            (COMMITTED — reviewed via PR)
  album/           # original-vs-clone comparison pages             (git-ignored)
```

`_webclone/captures/` and `_webclone/album/` are added to `.gitignore` in Phase 0. `design-model/` stays committed — it is the durable artifact future maintainers (and the next clone run) build from.

## Parallel build model (Phase 3)

One dispatcher (you) + N builder subagents. Each builder gets its own git worktree and exactly ONE section-chunk spec plus `references/failure-gates.md` and `.claude/rules/coding.md`. One subagent per task — no cross-task context pollution. Builders never touch shared files; conflicts are escalated back to the dispatcher.

## Definition of done (per screen)

All hard gates green (`lint`, `tsc --noEmit`, `test`, `gates.ts`) · spec satisfied incl. declared state · mock data wired through Zod + React Query · side-by-side album entry exists · no credentials anywhere. Full checklist: `references/phase-5-qa.md`.

## Out of scope (v1 — do not build)

Pixel-diff automation · any Figma intermediate layer · MSW · content translation · exam-player playbook (timer/audio/drag-drop — parked for v1.1; recon still records it, build defers).
