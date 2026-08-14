# Project Status

_Last updated: 2026-08-12_

## Phase

**Phase 0 — Project setup (2026-08-08).** The project folder was created and the backlog seeded with
the initial six items. No item has been started yet; several (TypeScript 7, FontAwesome,
`oil-tracker` environment system) need research or a decision before implementation — see
[backlog.md](./backlog.md) for which items are decision-gated.

## Done

- 2026-08-12: CLI Tooling section added to the backlog, with open question #4 covering which
  argument-parsing, prompt, colour and progress packages the scripts should adopt. Prompted by the
  content sync script built in the resume-generation project, which is the first genuinely
  interactive script here and the first to make the hand-rolled `src/scripts/cli/args.ts` and
  `src/support/terminal.ts` feel thin.
- 2026-08-12: Fixed `cspell.config.mjs`, which copied `.prettierignore` into `ignorePaths` without
  stripping comment lines. cspell reads that list as gitignore-style, so the `#` comment made it
  discard the surrounding entries and check **zero files** while reporting success. It now checks
  1429, and the 25 domain terms that had accumulated unnoticed went into `dictionary.txt`.
- 2026-08-08: Project folder created; backlog seeded with the initial six items.

## In Progress

- Nothing yet.

## Next

- Pick the first item to work. Reasonable starting candidates: the Prisma upgrade (self-contained,
  removes active deprecation noise) or the `~` → `@` path-alias change (mechanical, wide but
  low-risk).
- The CLI stack decision (#4) is the one with a waiting consumer: the content sync script's
  hardening backlog in the resume-generation project is largely blocked on it.
