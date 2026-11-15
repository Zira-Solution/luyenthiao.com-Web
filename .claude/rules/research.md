# Rule: Research Standards (luyenthiao.com-Web)

## Scope
Applies whenever the user asks a question whose correct answer depends on facts that are
not already verified in the current context.

## 1. When Research Is MANDATORY
Research before answering if the question touches any of:
- Library / framework / tool APIs, options, versions, or behavior
- Error messages, stack traces, or failure modes
- Pricing, quotas, limits, region availability, deprecation status
- "How do I ...", "Does X support ...", "What is the best way to ...", "Why does X happen"
- Any claim about a third-party service (AWS, cloud providers, SaaS APIs)
- Anything where being wrong would send the user down a wrong path

If an answer would be assembled from memory about an external system: **research first.**

## 2. Source Quality Hierarchy
Use the highest tier available. Do not stop at a low tier when a high tier exists.

1. **The code / files in front of you** — read the actual source, config, lockfile,
   `node_modules`, or installed package. This beats all documentation.
2. **Official primary docs** — vendor documentation, API reference, official spec,
   RFC, standards body. For AWS: official AWS docs + the relevant AWS skill.
3. **Official repository** — source code, CHANGELOG, release notes, migration guides,
   maintainer-answered GitHub issues.
4. **High-quality secondary** — well-known engineering blogs from the maintainers,
   conference talks by the authors, peer-reviewed material.
5. **Last resort, flag it** — Stack Overflow, community blogs, forum posts. Treat as a
   hypothesis to verify against tiers 1-3, never as the final answer.

**Never acceptable as the basis for an answer:** unverified memory, content-farm /
SEO blog spam, AI-generated articles, outdated tutorials, or a plausible-sounding guess.

## 3. Procedure
1. Identify precisely what fact is missing.
2. Gather it with the appropriate tool:
   - Local: `Read`, `Grep`, `Glob`, `codegraph_explore`
   - External: `WebSearch` then `WebFetch` on the authoritative page found
   - Domain: the matching Skill (e.g. `tailwind-4-docs`, `vercel-react-best-practices`) BEFORE general knowledge
3. **Cross-check** anything consequential against a second independent source.
4. **Check recency.** Note the doc's version / date. Verify it matches the version the
   user actually has installed.
5. Answer, citing where each non-obvious claim came from (URL, file path, or doc section).

## 4. Prohibited Behavior
- Presenting an unverified recollection as fact.
- Inventing API names, function signatures, config keys, CLI flags, or parameters.
- Answering "it should work like this" when the real answer is one search away.
- Citing a source you did not actually open and read.
- Padding an answer with hedged filler to avoid admitting a gap.

## 5. When Research Fails
If the fact cannot be verified, say so directly. Do not fill the gap with a guess.

Acceptable:
> I could not find official documentation confirming this. Checked: [sources consulted].
> I need [specific information] from you, or I can write a small test to verify.

If a hypothesis is genuinely unavoidable, prefix it exactly:
> ⚠️ [SPECULATION]: ... (state that this is speculation, the reasoning behind it, and what data is missing)

## 6. Reporting
- Report findings to the user in Vietnamese (see `AGENTS.md`); keep technical identifiers (API names, flags, error strings, code) verbatim, in their original form.
- Link the source so the user can verify independently.
- Separate clearly: what is **verified**, what is **inferred**, what is **unknown**.
