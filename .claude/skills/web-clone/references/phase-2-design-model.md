# Phase 2 — Design Model (the normalization layer)

This is the layer that cures the transcription disease: between raw captures and code stands a **reviewed, versioned model** of what the site is. No builder ever reads raw HTML; builders read specs. (This is the salvaged gem of the rejected Figma idea: normalization + human review, without Figma's tax.)

Output lives in `_webclone/design-model/` and is **committed and reviewed via PR** — fixing a wrong spec here costs minutes; the same wrongness in code costs days.

## 1. Design tokens

Start from `templates/design-tokens.json`. Fill it from captures: brand + semantic colors, typography scale, spacing scale, radii, shadows, breakpoints. Map into Tailwind v4 via `@theme` in `src/app/globals.css` during Phase 3 foundation. Only tokens actually used by specs belong here — no speculative palettes.

## 2. Section specs

One file per section chunk, from `templates/section-spec.md`, into `_webclone/design-model/sections/`. A spec is **rejected** (class B) unless it declares:

- layout intent tree (≤ 6 deep — deeper means re-think, not transcribe)
- component mapping: existing shadcn/ui primitive, existing repo component, or genuinely-new
- **state, validation, and interactions** — even for "visual" sections, declare hover/press/selected states; for forms, every field with its Zod rule
- mock-data shape (Zod schema name + example JSON path)
- evidence grade per non-obvious detail (SOURCE / PARTIAL / GUESS)
- the reuse check performed (gate A5): which existing components were searched and considered

## 3. Chunking — the 3 principles

Split pages into section chunks so that parallel builders cannot collide:

1. **Mutual exclusivity** — no two chunks write the same file. Shared pieces (a card used by two sections) are hoisted OUT into a shared chunk built first.
2. **Complete coverage** — every visible section of every captured route belongs to exactly one chunk. Nothing orphaned, nothing double-claimed.
3. **Size control** — one chunk ≈ 1–3 components, each file ≤ ~320 lines (gate A3). Bigger sections split by sub-section.

Record the chunk map in `_webclone/design-model/chunks.md` (chunk id → files it may create/touch → dependencies).

## 4. Human review point — the gate of this phase

Open a PR containing tokens + specs + chunks.md. The user (or their lead) reviews structure and intent, not pixels. Fixes land in specs. **After approval the Design Model is frozen**; changing a spec later requires re-approval — this is what keeps N parallel builders consistent.

## Done when

Tokens complete · every non-player route fully covered by approved specs · chunks.md satisfies all 3 principles · PR approved. → Phase 3.
