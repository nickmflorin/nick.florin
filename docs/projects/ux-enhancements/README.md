# UX Enhancements Project — Working Context

This folder is the persistent working context for the ux-enhancements project: a running program of
small, user-facing polish items — visual refinements, sizing and layout adjustments, and interaction
improvements that make the site feel more finished. It exists so that any session (human or AI) can
pick up exactly where the last one left off. **Read this file first, then
[status.md](./status.md).**

## What This Project Is

Like the repo-cleanup project, this is an umbrella for independent items rather than a single
feature effort. Each item is self-contained: it can be scoped, decided, and landed on its own branch
without depending on the others. The backlog is the source of truth for what is in scope; new polish
items get added to it as they come up rather than spawning new ad-hoc projects.

The initial slate (2026-08-09):

- Shrinking the displayed sizes of the lower-resolution images on the GreenBudget project page,
  including the mobile and PDF-export images.

## Files in This Folder

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| [status.md](./status.md)                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)               | Running checklist of work items, organized by page/area          |
| [open-questions.md](./open-questions.md) | Unresolved questions that need discussion/decisions              |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **Items are independent.** Each backlog item lands on its own branch/PR. Do not bundle unrelated
  polish items into one change — a stalled item must not block the others.
- **Changes are visual — verify them visually.** A sizing or layout item is not done until it has
  been looked at in the browser at the breakpoints it affects, not just compiled.
