# Phase 1 — Recon (the hybrid eye)

Two instruments, two jobs: **Playwright MCP explores** (clicks around, logs in, classifies screens), **`capture.ts` harvests** (bulk screenshots + HTML + assets at 3 viewports). Exploration without bulk capture doesn't scale to "every screen"; bulk capture without exploration produces classified-wrong screenshots.

## 1. Explore & inventory (MCP)

1. Open `CLONE_TARGET_URL`. Record the login flow shape (selectors used by `capture.ts` CONFIG).
2. Log in using the `.env` credentials (typed into the browser, never printed).
3. Walk EVERY reachable screen, including behind auth: home, practice lists, challenge modes, exam history, missions, notifications, trophy/ranking, level check, handbook, teacher/parent areas. Use the sitemap (`/sitemap.xml`), nav links, and dead-end hunting.
4. For each screen run the **interaction sweep** — in this order:
   - **scroll** first (lazy sections, reveal-on-scroll animations, infinite lists)
   - then **click** (tabs, accordions, modals, menus, filter dropdowns)
   - then **hover** (tooltips, button states)
5. Write `_webclone/captures/screen-inventory.md` — one row per screen:

| Route | Auth? | Type | Interaction model | Notes |
|---|---|---|---|---|
| `/` | public | static | scroll-reveal hero | … |
| `/login` | public | form | validate + redirect | … |
| `/exam-room/…` | auth | **player** | click-driven, timer/audio/drag | boss fight — record, build later (v1.1) |

`Type` ∈ `static | form | player`. Players are recorded now but **deferred to the v1.1 playbook** — recon them anyway so nothing is a surprise.

## 2. Bulk capture (script)

Create `_webclone/captures/routes.json` from the inventory (see the file's schema inside `scripts/capture.ts`), then:

```bash
npx tsx .claude/skills/web-clone/scripts/capture.ts
```

Per route × viewport (1440 / 768 / 390): full-page screenshot, HTML snapshot, visible-text dump. Output under `_webclone/captures/{route-slug}/`.

Then harvest assets verbatim:

```bash
npx tsx .claude/skills/web-clone/scripts/capture.ts --download-assets
```

→ `public/clone-assets/` + `_webclone/captures/assets-manifest.json`.

## 3. Capture discipline (the 80% cascade)

- Capture **layout intent** — structure, hierarchy, spacing scale, breakpoints. Do NOT dump per-element computed styles; the 80% bar makes them noise.
- Tag evidence as you go: **SOURCE** (seen in capture/MCP), **PARTIAL** (inferred from responsive variants), **GUESS** (reconstructed). Guesses must be marked so Phase 2 can flag them for the human reviewer.
- Vietnamese copy is captured **verbatim** — no translation, no paraphrase.

## Done when

Inventory covers every reachable screen (incl. players, marked deferred) · captures exist for every non-player route at 3 viewports · assets downloaded · evidence tags present. → Phase 2.
