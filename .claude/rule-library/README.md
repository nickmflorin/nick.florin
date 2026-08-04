# Rule Library (On-Demand Tier)

Reference material for AI agents that is **not** auto-loaded into sessions. A skill, a slash
command, or the developer loads a file from here explicitly, by path, when the task calls for it.

## How Rules Load in This Repo

Rules are Markdown guidance loaded into context. There is **no enforcement engine** — a loaded rule
is a strong suggestion the model attends to, not a gate. If something _must_ always hold, make it a
real guardrail (a hook, a lint rule, a CI check), not a rule. The
`.claude/hooks/guard-generated-files.sh` hook is the local example: "never edit Prisma migrations"
is enforced mechanically, not stated in prose.

Three tiers, by how they load:

1. **Always-on** — `.claude/rules/*.md` with no `paths:` frontmatter loads into every session.
   Reserved for genuinely cross-cutting context, kept small because it is paid on every turn. Today:
   `codebase-index.md`, `discovery.md`.
2. **Path-scoped** — `.claude/rules/**/*.md` with a `paths:` glob loads only when a matching file is
   edited. Overlapping globs compose. Today: `code-quality/`, `documentation/`, `workflow/`.
3. **On-demand** — this directory. Never auto-loaded; referenced by explicit path from skills or
   conversation. Use it for reference depth and process patterns that would be wasted context in the
   other two tiers.

Unlike `.claude/rules/`, this tier has **no Copilot mirror** under `.github/instructions/` — Copilot
has no on-demand loading concept, so parity does not apply here.

## Current Files

| File                                                                         | Description                                                          |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [refactoring/preservation-contract.md](refactoring/preservation-contract.md) | What must not change during a refactor, stated before editing        |
| [git/trial-merge.md](git/trial-merge.md)                                     | Non-destructive conflict detection against `origin/master`           |
| [skills/self-improving-skills.md](skills/self-improving-skills.md)           | Feedback-loop pattern for folding user corrections back into a skill |
