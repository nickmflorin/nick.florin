# Project Status

_Last updated: 2026-08-04_

## Phase

**Phase 0 — Audit & project setup (complete 2026-08-04).** The full performance audit of the app
shell, providers, and the dashboard/resume/projects routes is recorded in
[findings.md](./findings.md). No implementation has started. The next step is resolving the blocking
entries in [open-questions.md](./open-questions.md) (none block Phase 1) and starting Phase 1 of
[backlog.md](./backlog.md) — restoring SSR — on a dedicated branch.

## Done

- 2026-08-04: Performance audit completed across three areas — the layout/provider shell
  (`AppConfig`, `ClientConfig`, root layouts, header/nav), the dashboard parallel routes, and the
  resume + projects routes. Headline findings: the `<ClerkLoaded>` gate makes every route's initial
  HTML a full-screen spinner, and the `ssr: false` dynamic provider chain in `ClientConfig` disables
  SSR for the entire page subtree. Full record in [findings.md](./findings.md).
- 2026-08-04: Project scaffolding created at `docs/projects/app-performance/` (`README.md`,
  `findings.md`, `status.md`, `decisions.md`, `backlog.md`, `open-questions.md`) and registered in
  `docs/index.md`.
- 2026-08-04: Fix sequencing decided — SSR restoration first; see [decisions.md](./decisions.md).

## In Progress

- Nothing. Implementation has not started.

## Next

1. Discuss [open-questions.md](./open-questions.md) — at minimum #5 (chart `fallbackData`) and #6
   (tour loading), which gate Phase 2 items; #1 Option B, #2, #3, and #4 gate later phases.
2. Create the working branch and start Phase 1 of [backlog.md](./backlog.md): capture the baseline
   HTML/Lighthouse numbers, remove the `ClerkLoaded` gate, statically import the cheap providers,
   and verify the server HTML contains page content.
