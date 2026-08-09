# Rebrand Project — Working Context

This folder is the persistent working context for the rebrand project: a new style guide and visual
identity for the site, and the infrastructure changes needed to support it. It exists so that any
session (human or AI) can pick up exactly where the last one left off. **Read this file first, then
[status.md](./status.md).**

## What This Project Is

An umbrella for everything related to rebranding the site. Unlike the smaller polish items in the
ux-enhancements project, the pieces here serve one coherent effort — a new brand — but they are
scoped, designed, and landed as separate work items. The backlog is the source of truth for what is
in scope; new rebrand items get added to it as they come up.

The initial slate (2026-08-09):

- **Light/dark mode support** — a three-way theme preference (light, dark, or system default),
  persisted in a cookie since the app is unauthenticated, with the styling layer reworked so colors
  swap at the token level rather than per usage. The recommended architecture is written up in
  [theming.md](./theming.md).

Future items (style guide, palette, typography, visual identity) will be added to
[backlog.md](./backlog.md) as they are scoped.

## Files in This Folder

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| [status.md](./status.md)                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)               | Running checklist of work items, organized by area               |
| [open-questions.md](./open-questions.md) | Unresolved questions that need discussion/decisions              |
| [theming.md](./theming.md)               | Recommended architecture for light/dark/system theme support     |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **Architecture is written before it is built.** Substantial design work (like
  [theming.md](./theming.md)) is captured as a document in this folder while it is still a
  recommendation. When a recommendation is ratified or changed in discussion, that lands as an entry
  in [decisions.md](./decisions.md).
- **Nothing starts until asked.** Documents here may describe implementation-ready plans; work on
  them begins only when the developer says so.
