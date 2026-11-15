# Workflow Rules

## Where things go

- Specs: `.claude/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- Plans: `.claude/superpowers/plans/YYYY-MM-DD-<topic>.md`

## New Feature Process

1. **Brainstorm first** — use `superpowers:brainstorming` skill
2. **Write a plan** — use `superpowers:writing-plans` skill
3. **Write test cases before implementing** — use `superpowers:test-driven-development` skill
4. **Execute** — use `superpowers:executing-plans` or `superpowers:subagent-driven-development`
5. **Verify** — see `.claude/rules/verification.md`
6. **Review in two stages** — `spec-reviewer`, then `code-reviewer` (`.claude/rules/agent-roles.md`)

## Skill Selection Guide

| Situation                    | Skill                                        |
| ---------------------------- | -------------------------------------------- |
| Starting a new task          | `superpowers:brainstorming`                  |
| Have a spec, need a plan     | `superpowers:writing-plans`                  |
| Need to write test cases     | `superpowers:test-driven-development`        |
| Executing an existing plan   | `superpowers:executing-plans`                |
| Debugging a bug              | `superpowers:systematic-debugging`           |
| Feature done, need to verify | `superpowers:verification-before-completion` |
| Designing UI                 | `frontend-design` (in `.claude/skills/`)     |
| Optimising Tailwind          | `tailwind-4-docs` (in `.claude/skills/`)     |
| Creating a page / heavy component / pre-deploy | `performance` (in `.claude/skills/`) |
| Writing metadata / openGraph / canonical | `seo-metadata` (in `.claude/skills/`) |
| Semantic HTML, ARIA, JSON-LD, sitemap | `html5-seo` (in `.claude/skills/`) |

## Adding a shadcn/ui Component

```bash
cd src
npx shadcn@latest add <component-name>
# Examples:
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
```

The component is created at `src/components/ui/`. Then add its export to `src/components/ui/index.ts`.

## New Page Process

1. Create directory `src/app/[route]/`
2. Create `src/app/[route]/page.tsx` following the 5-part pattern
3. Create directory `src/components/[route]/` for page-specific components
4. Add the route to `src/constants/index.ts` inside the `ROUTES` object
5. Add the route to `src/app/sitemap.ts` if it is a public page

## Format & Lint Before Finishing

```bash
cd src
npx prettier --write <changed files>
npm run lint
npx tsc --noEmit
npm test
npm run build   # informational until the missing mocks are rebuilt; see docs/03-known-issues.md
```
