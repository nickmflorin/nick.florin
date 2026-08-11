# Resume Generation Project — Working Context

This folder is the persistent working context for the long-term resume/portfolio content
centralization project. It exists so that any session (human or AI) can pick up exactly where the
last one left off. **Read this file first, then [status.md](./status.md).**

## What This Project Is

See [initial-project.md](./initial-project.md) for the original project description. In short: bring
all portfolio content — PDF resume, HTML resume, this website, and the LinkedIn profile — under a
single source of truth that models not just the content itself but _where and how_ each piece is
rendered and distributed. Key tenets:

1. **Single source of truth** for content, with per-medium distribution/visibility flags.
2. **Fixture-file ⇄ database syncing** in both directions (production DB, local dev DB, and fixture
   files), so content can be iterated on with Claude without a running database.
3. **Built in parallel** with the existing app's models/database — a new modeling foundation is
   established alongside the old one, and the UI adopts it gradually. Two sources of truth may
   coexist for a while; that is expected.
4. **Dynamic resume generation**: eventually the app generates the PDF/HTML resume from live
   database content on demand, and the same capability is exposed as a script that can run against
   fixture files.
5. **External syndication**: LinkedIn API syncing, GitHub-driven content updates (both deterministic
   and Claude-assisted).
6. **The competency registry is an exhaustive catalog** (decided 2026-08-10, see
   [decisions.md](./decisions.md)): it records everything Nick has used, learned, and worked with
   throughout his career. Membership is never determined by any syndication channel — a competency
   shown nowhere is normal and expected. Channels select from the catalog; the catalog never mirrors
   the channels.

The `resume-gen` repo (`~/repos/resume-gen`, an Astro app) is the current standalone resume
generator. Its content types are the _general_ direction for the new modeling here, and its
functionality will gradually be ported into this app.

## Files in This Folder

| File                                                     | Purpose                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| [initial-project.md](./initial-project.md)               | Original project description (source document, do not edit)      |
| [status.md](./status.md)                                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)                           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)                               | Running checklist of work items, organized by domain             |
| [context/current-app.md](./context/current-app.md)       | Map of this repo's existing data layer, fixtures, scripts        |
| [context/resume-gen.md](./context/resume-gen.md)         | Map of the `resume-gen` Astro repo and its content types         |
| [context/open-questions.md](./context/open-questions.md) | Unresolved questions that need discussion/decisions              |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **The context maps are snapshots.** `context/*.md` files record what was true when written; when
  code has moved on, verify against the code and refresh the map.
- **New-model code is parallel code.** Nothing in the existing modeling/database layer gets broken
  or removed until the new foundation is stable and adopted. The Admin CMS stays on the old models
  the longest (lowest priority to migrate), but the app must always build.
