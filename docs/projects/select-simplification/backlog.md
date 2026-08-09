# Backlog

Research and work items for the select simplification project. Phase 0 is research-only: nothing in
the stack changes until the audit and the input/content separation design have been worked through.

## Phase 0 — Audit & Design

- [ ] **Audit the select stack.** Map the layers (`useSelect`, `useDataSelect`, `DataSelectBase`,
      `DataSelect`, `DataSelectInput`, `SelectPopover`) and their responsibilities; catalog the
      accidental complexity with the defects it produced: the `NOTSET` model-value latch (fixed
      2026-08-08 by re-keying the initialization effect), the
      `isReady`/`isInputLoading`/`isPopoverLoading`/`isLocked`/`isAwaitingData` flag matrix and the
      `locked()`/`loading()` mixin mix-up, and the value-vs-model-value duality that exists because
      the value (ids) and the models that render it can arrive at different times. Also inventory
      every surface that renders a select (chart filter popover/drawer, admin filter bars, admin
      forms, admin table cells) so restructures can be verified against all of them.

- [ ] **Research: separate the popover content from the input so deferred data suspends only the
      content.** The headline item, carried over from the 2026-08-09 promise-streaming discussion in
      the app-performance project. The current design suspends the _entire_ select:
      `StreamedEducationSelect`/`StreamedExperienceSelect` call `use(dataPromise)` at the top, so
      the `Suspense` fallback must render a parallel "fallback twin" of the select in its
      awaiting-data state, and resolution swaps in a fresh instance. The desired shape is a
      `DataSelect` that accepts deferred data directly and localizes the waiting to the menu:

  ```tsx
  // The input shell renders immediately — no fallback twin, no remount on resolution — and the
  // menu content resolves the promise with use() behind the popover's own loading state.
  <DataSelect data={educationsPromise} options={{ behavior, getModelValue }} />
  ```

  Why this is a restructure rather than a prop change: `data` is not only a menu concern today. The
  input consumes it too — `useDataSelect` maps the value (ids) into models for the input's
  chips/labels, and the `NOTSET`/`isReady` machinery exists to manage the window where a value
  exists but its models are not yet lookupable. Separating content from input therefore requires the
  input to render a value _without_ resolved models (ids-first value handling, a label cache, or
  per-value label resolution), with model resolution moving inside the popover/data boundary. Useful
  facts from the 2026-08-09 analysis:

  - An **empty** value needs no data to initialize — the hard cases are exclusively non-empty-value
    mounts (a form reopened with filters already set, an admin cell with an existing value).
  - The popover content already mounts only while open, so a `use()` inside it suspends lazily by
    construction; the menu's existing loading indicator is the natural fallback.
  - The intermediate, no-restructure alternative — resolving the promise into state with an effect
    and feeding the existing `isReady`/`isInputLoading` props — avoids suspension entirely but rides
    the async-`isReady`-flip initialization path, the historically fragile one. A simplified stack
    should make that path either safe by construction or unnecessary.
  - If promise-fed selects spread (e.g. to the admin filter bars when the admin CMS is next worked
    on — see the follow-up in `docs/projects/app-performance/backlog.md`), the per-site `Suspense` +
    fallback-twin plumbing multiplies; solving it once inside `DataSelect` is what amortizes.

- [ ] **Research: collapse the per-domain wrapper triplets.** Each domain accumulates variants that
      differ only in data source — `EducationSelect` (data as props), `ClientEducationSelect` (SWR),
      `StreamedEducationSelect` (promise prop) — times eight domains. A data-source- agnostic `data`
      prop (array, promise, or fetch config) or a single composition pattern should replace the
      triplet; depends on the input/content separation design.

- [ ] **Research: simplify the readiness/loading state machinery.** Whatever design comes out of the
      items above, the flag matrix should shrink: the awaiting-data behavior (input interactive,
      menu shows loading) should be derivable from the data source's state rather than coordinated
      by callers through `isReady` + `isInputLoading` conventions.

## Phase 1 — Implementation

Deliberately empty until Phase 0 produces a design.
