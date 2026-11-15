# Rule: Git Workflow (luyenthiao.com-Web)

## Scope
Applies to every git operation in this repository.

## 1. Permission Tiers

### Tier A — Read-only (NO approval needed)
Run these freely, without asking:
- `git status`, `git diff`, `git diff --staged`, `git show`
- `git log`, `git log --oneline`, `git blame`
- `git branch` (list), `git remote -v`, `git config --get *`
- `git stash list`, `git tag` (list), `git ls-files`
- `git fetch --dry-run`, `git rev-parse`, `git describe`

### Tier B — Local mutations (REQUIRE explicit approval)
Never run until the user has explicitly asked for this specific action:
- `git add`, `git restore`, `git reset`, `git rm`
- `git commit` (and `--amend`)
- `git checkout -b`, `git switch -c`, `git branch -d`
- `git merge`, `git rebase`, `git cherry-pick`
- `git stash push`, `git stash pop/apply/drop`
- `git clean`

### Tier C — Remote / outward-facing (REQUIRE explicit approval, ALWAYS)
Never run on inference, never bundle with other work, never retry after a denial:
- `git push` (and `--force`, `--force-with-lease`, `--tags`)
- `git pull`, `git fetch` (actual fetch), `git remote add/remove/set-url`
- `git tag` creation + push, `git submodule` updates
- Any `gh` command that writes: `gh pr create`, `gh pr merge`, `gh issue create`,
  `gh release create`, `gh repo create`, `gh api` with POST/PATCH/PUT/DELETE

## 2. Approval Semantics
- Approval is **per action, per request**. Permission to commit is NOT permission to push.
- Approval granted once does NOT carry over to the next turn or the next task.
- If the user denies a git action, do not re-attempt it in a different form.
- "Make this change" / "fix this bug" is NOT approval to commit. Finish the edit, then stop
  and report. Let the user decide when to commit.

## 3. Commit Message Standards
- **Language: English only.** No exceptions, regardless of the conversation language.
- **Keep it short.** Subject line <= 72 chars, imperative mood, lowercase after the type prefix.
- Prefer Conventional Commits when the repo already uses them: `fix:`, `feat:`, `refactor:`,
  `docs:`, `test:`, `chore:`, `perf:`, `build:`, `ci:`
- Body is optional. Add it only when the "why" is not obvious from the subject. Max a few
  short lines. No bullet-point essays.

### ABSOLUTELY FORBIDDEN in commit messages
- `Co-Authored-By:` trailers of ANY kind — including
  `Co-Authored-By: Claude <noreply@anthropic.com>` and every model variant.
- `Generated with Claude Code`, `🤖 Generated with ...`, or any AI attribution line.
- Emoji, promotional footers, links to AI tools.

The commit message contains ONLY the description of the change. Nothing else.

### Examples
```
GOOD:  fix: handle null token in auth middleware
GOOD:  feat(api): add pagination to /users
GOOD:  refactor: extract retry logic into helper
GOOD:  docs: correct install steps for Windows

BAD:   Fixed the bug 🤖 Generated with Claude Code
BAD:   fix: handle null token

       Co-Authored-By: Claude <noreply@anthropic.com>
BAD:   sua loi dang nhap          (Vietnamese — not allowed)
BAD:   update                      (meaningless)
```

## 4. Branch Safety
- Never commit directly to `main` / `dev` unless the user explicitly says so.
  If on a protected branch and a commit is approved, propose a feature branch first.
- Never force-push to a shared branch. `--force-with-lease` on a personal branch still
  requires explicit approval.
- Never run destructive history rewrites (`reset --hard`, `rebase` on pushed commits,
  `filter-branch`) without the user stating the intent in that turn.

## 5. Before Committing (when approved)
1. `git status` + `git diff --staged` — confirm exactly what is staged.
2. Verify no secrets, credentials, `.env` files, or large binaries are included.
3. Stage only files relevant to the change. Never `git add -A` / `git add .` blindly.
4. Write the message per section 3.
5. After committing, report the short SHA and subject. Then stop — do not push.
