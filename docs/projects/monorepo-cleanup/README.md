# Monorepo Cleanup Project — Working Context

This folder is the persistent working context for the monorepo-cleanup project: a running program of
general repository maintenance — dependency upgrades, tooling modernization, convention
simplification, and the removal of dependencies that no longer earn their keep. It exists so that
any session (human or AI) can pick up exactly where the last one left off. **Read this file first,
then [status.md](./status.md).**

## What This Project Is

Unlike the feature-shaped projects in this folder, this one is an umbrella for independent
maintenance items that have accumulated but never had a home. Each item is self-contained: it can be
researched, decided, and landed on its own branch without depending on the others. The backlog is
the source of truth for what is in scope; new items get added to it as they come up rather than
spawning new ad-hoc projects.

The initial slate (2026-08-08), in no particular order:

- Upgrading Prisma and cleaning up its deprecation warnings.
- Adopting the environment system from `oil-tracker` and simplifying environment variables,
  particularly around `VERCEL_ENV` and `NODE_ENV`.
- Moving to TypeScript 7.
- Removing the `enumerated-literals` dependency.
- Considering a move away from FontAwesome, for simplicity and to drop the license.
- Changing the path alias from `~` to `@`.

## Files in This Folder

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| [status.md](./status.md)                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)               | Running checklist of work items, organized by domain             |
| [open-questions.md](./open-questions.md) | Unresolved questions that need discussion/decisions              |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **Items are independent.** Each backlog item lands on its own branch/PR. Do not bundle unrelated
  cleanup items into one change — a stalled item must not block the others.
- **"Consider" items conclude with a decision, not a diff.** Items phrased as investigations (e.g.
  the FontAwesome question) end with a written recommendation and an entry in
  [decisions.md](./decisions.md); implementation is a separate, unlocked item.
- **Cleanup must not change behavior.** These are maintenance changes: after each item, the app
  builds, tests pass, and user-facing behavior is unchanged unless a decision explicitly says
  otherwise.
