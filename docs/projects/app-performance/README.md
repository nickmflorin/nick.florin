# App Performance Project — Working Context

This folder is the persistent working context for the app-performance project: maximizing first
paint, restoring server-side rendering of page content, reducing the client bundle, and eliminating
the flickering observed on page load. It exists so that any session (human or AI) can pick up
exactly where the last one left off. **Read this file first, then [status.md](./status.md).**

## What This Project Is

A full performance audit of the application shell, providers, and page routes was completed on
2026-08-04 (recorded in [findings.md](./findings.md)). The headline finding: the app is effectively
client-rendered despite being built on React Server Components, because the entire tree is gated
behind `<ClerkLoaded>` and every provider under `ClientConfig` is loaded with
`dynamic(..., { ssr: false })`. The server sends a full-screen spinner as the initial HTML for every
route, and real content appears only after hydration, Clerk's CDN bundle, and a sequential chain of
provider chunks all resolve.

The project's charter, in priority order:

1. **Restore SSR of page content** — remove the Clerk gate and the `ssr: false` provider chain so
   the HTML the server sends is the page itself, not a spinner.
2. **Eliminate load flicker** — icon pop-in from the FontAwesome kit script, the dashboard chart's
   post-hydration SWR fetch, and loading fallbacks that do not match final layout.
3. **Unblock route streaming** — cache or restructure blocking layout-level fetches (the
   `/projects/*` nav fetch, the header's resumes query).
4. **Cut bundle and payload size** — code splitting on project pages, trimming server→client
   serialization, and the multi-megabyte project PNGs.

Implementation happens on a dedicated branch; this folder (committed to `master` first) is the
shared context for that work.

## Files in This Folder

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| [findings.md](./findings.md)             | The 2026-08-04 audit: what was found, why it matters, what's OK  |
| [status.md](./status.md)                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)               | Ordered work items, organized by phase                           |
| [open-questions.md](./open-questions.md) | Unresolved questions that need discussion/decisions              |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **The findings are a snapshot.** [findings.md](./findings.md) records what was true on 2026-08-04;
  when code has moved on, verify against the code before acting on a finding.
- **Verify with evidence, not vibes.** The shell fixes change what HTML the server sends. Before and
  after each phase, confirm behavior with a view-source/`curl` check of the rendered HTML and a
  Lighthouse (or Vercel Speed Insights) comparison, and record the result in `status.md`.
- **Fixes must not change behavior.** Auth-gated UI (admin nav item, user menu) must degrade
  gracefully while the session resolves, not disappear or flash incorrectly. The tour, drawers, and
  toasts must keep working after their providers move.
