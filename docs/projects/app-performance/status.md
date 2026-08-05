# Project Status

_Last updated: 2026-08-04_

## Phase

**Phase 1 — Restore SSR (started 2026-08-04).** Phase 0 (audit & project setup) is complete and all
six open questions were resolved on 2026-08-04 — see [decisions.md](./decisions.md). Headline
decisions: Clerk is scoped to authenticated routes entirely (Option B), FontAwesome migrates off the
CDN kit (its own phase), layout fetches get cross-request caching, and project images are
pre-converted to WebP/AVIF. Implementation proceeds on a dedicated branch per the
[backlog.md](./backlog.md) phases.

## Done

- 2026-08-04: Performance audit completed across three areas — the layout/provider shell
  (`AppConfig`, `ClientConfig`, root layouts, header/nav), the dashboard parallel routes, and the
  resume + projects routes. Headline findings: the `<ClerkLoaded>` gate makes every route's initial
  HTML a full-screen spinner, and the `ssr: false` dynamic provider chain in `ClientConfig` disables
  SSR for the entire page subtree. Full record in [findings.md](./findings.md).
- 2026-08-04: Project scaffolding created at `docs/projects/app-performance/` and registered in
  `docs/index.md`.
- 2026-08-04: Fix sequencing decided — SSR restoration first; see [decisions.md](./decisions.md).
- 2026-08-04: All six open questions resolved and recorded in [decisions.md](./decisions.md);
  [backlog.md](./backlog.md) restructured accordingly (Option B reshapes Phase 1; the FontAwesome
  migration became Phase 5).

## In Progress

- Phase 1 of [backlog.md](./backlog.md): baseline capture, Clerk scoping (Option B), and static
  provider imports, on the working branch.

## Next

1. Capture the baseline server HTML (`/dashboard`, `/resume/experience`, one `/projects/*` page) and
   a Lighthouse run before any code changes.
2. Land the Clerk scoping and provider changes; verify the server HTML contains page content and
   record the result here.
