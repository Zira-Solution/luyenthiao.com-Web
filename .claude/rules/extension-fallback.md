# Extension Fallback Rules

> Applies only when the session is confirmed to be running in a VSCode-based IDE extension (e.g. Claude for VSCode on Antigravity). The CLI has full native support for skills, hooks, and MCP — this file does not apply there.

## Why this file exists

The extension silently drops capabilities it can't fulfill: custom skills aren't invocable via `/skill`, hooks in `settings.json` don't fire, MCP servers (Codegraph) may be unavailable, and sessions don't persist. It proceeds without warning when this happens, which is what causes brainstorming, Codegraph queries, and workflow steps to get skipped. The fallback rules below are equivalent standards expressed as inline instructions — not a downgrade.

## 1. Brainstorming (replaces `superpowers:brainstorming`)

Before starting any task, answer inline:
- What is the user actually asking for? (intent, not literal words)
- What assumptions could be wrong?
- 2–3 possible approaches and their trade-offs
- Which one is recommended, and why
- What existing code/components might be affected

## 2. Codegraph (replaces MCP `codegraph_explore`)

1. Try `graphify query "<question>" --budget 1500` (map).
2. Then `mcp__codegraph__codegraph_explore` or the `codegraph explore` CLI (precise symbols).
3. Only then `Grep` → `Glob` → `Read`.
4. Before touching any file, search for existing components/hooks/utils that already solve the problem. Never assume something doesn't exist without checking.

## 3. Writing Plans (replaces `superpowers:writing-plans`)

```
## Plan
- Goal: [what this achieves]
- Files to create: [list]
- Files to modify: [list]
- Components/hooks reused: [list]
- Potential risks: [list]
```
Wait for user approval before writing code.

## 4. Frontend Design (replaces `frontend-design` / `ui-ux-pro-max`)

State explicitly when building UI: typography choices, color/spacing decisions, which design pattern and why not a simpler one, any animation/interaction intent.

## 5. Pre-completion Checklist (replaces `superpowers:verification-before-completion`)

- [ ] TypeScript: no `any`, no unused variables
- [ ] Components: named exports, explicit return types, `[Name]Props` interface
- [ ] Imports ordered: Node → External → Internal → Relative
- [ ] Tailwind: `cn()` for conditionals, no inline styles
- [ ] `page.tsx`: no inline JSX markup, no logic
- [ ] Barrel exports (`index.ts`) updated if a component was added
- [ ] Would `npm run lint` and `npx tsc --noEmit` pass?

## Skill-specific inline behavior

See `.claude/rules/skill-fallback-table.md` for the per-skill reference table (tailwind-4-docs, seo-metadata, animate, gsap-react, etc.) — kept separate since it's lookup data, not a rule to hold in working memory for every task.
