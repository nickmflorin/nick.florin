# Select Simplification Project — Working Context

This folder is the persistent working context for simplifying the select component stack: the
`DataSelect` family, its hooks, and the per-domain wrapper components built on top of them. It
exists so that any session (human or AI) can pick up exactly where the last one left off. **Read
this file first, then [status.md](./status.md).**

## What This Project Is

The select stack (`src/components/input/select/` and the per-domain selects under
`src/features/*/components/input/`) grew organically and the developer is not happy with how it is
written. The machinery is layered — `useSelect` → `useDataSelect` → `DataSelectBase` → `DataSelect`,
plus `SelectPopover`/`DataSelectInput` — and carries accidental complexity that has produced real
defects: the `NOTSET` model-value latch behind the 2026-08-08 permanently-frozen selects, the
`isReady`/`isInputLoading`/`isPopoverLoading`/`isLocked`/`isAwaitingData` flag matrix, and the
value-vs-model-value duality. On top of it, every domain accumulates wrapper variants
(`EducationSelect` + `ClientEducationSelect` + `StreamedEducationSelect`) that differ only in where
their data comes from.

The project's charter:

1. **Audit the stack** — map the layers, their responsibilities, and where the accidental complexity
   and past defects live, before changing anything.
2. **Separate the popover content from the input** in a way that natively supports deferred data:
   the input renders immediately and only the menu content waits on data (the headline research item
   — see [backlog.md](./backlog.md)).
3. **Collapse the wrapper proliferation** — one data-source-agnostic pattern per domain instead of a
   plain/`Client*`/`Streamed*` triplet.
4. **Simplify the state machinery** — reduce the readiness/loading flag matrix and the
   `NOTSET`-based initialization to something that cannot latch.

This project was stubbed on 2026-08-09, spun out of the app-performance project's Phase 2b work:
promise-streaming the chart filter popover's select options (see
`docs/projects/app-performance/backlog.md`) worked, but required suspending the entire select behind
a fallback twin rather than just the menu content, and the discussion that followed concluded the
better shape needs restructuring the selects themselves.

## Files in This Folder

| File                       | Purpose                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| [status.md](./status.md)   | Current state: what's done, in progress, and next. Update often. |
| [backlog.md](./backlog.md) | Research and work items                                          |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md` and
  `backlog.md` (check items off, add new ones) before finishing. Stale context is worse than no
  context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **This stack is fragile — restructure with evidence.** The select machinery took three passes
  (2026-08-05 → 2026-08-08) to stabilize. Every behavioral claim about the current code should be
  verified against the code, and every restructure verified in the browser against the surfaces that
  render selects (the chart filter popover/drawer, admin filter bars, admin forms, admin table
  cells).
