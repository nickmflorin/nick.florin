# Backlog

The running list of work items, organized by area. Check items off as they land (`[x]`), and add new
items to the appropriate section as they come up (create a new section if none fits). Within a
section, keep rough priority order (top = sooner). Tag items that block others with **(blocker)**.

The two coverage sections are **seeded, not exhaustive**. Every item in them was picked for value ×
ease and comes pre-scoped with what it should assert, so that a session can pick one off the top and
write it without re-deriving the survey. When a section runs dry, survey again rather than reaching
for whatever is nearby.

> **Current stance (2026-08-11):** The harness is built and both lanes are open. Pick items off the
> top of either coverage section.

## Jest Configuration & Setup

_Done as one change set on 2026-08-11, apart from the two items still open at the bottom._

- [x] **(done 2026-08-11)** Add an `rtl` member to the `TestModule` enum and its display name in
      [`jest.config.base.ts`](../../../jest.config.base.ts), create
      `src/__tests__/rtl/jest.config.ts` with a jsdom environment,
      `testMatch: ['**/*.rtl.test.tsx']`, the `lodash-es` → `lodash` `moduleNameMapper` copied from
      the unit project, and a `setupFilesAfterEnv` entry, then register the new project in
      [`jest.config.ts`](../../../jest.config.ts).
- [x] **(done 2026-08-11)** Add `src/__tests__/rtl/jest.rtl.setup.ts` importing
      `@testing-library/jest-dom` and pinning `process.env.TZ = 'UTC'`.
- [x] **(done 2026-08-11)** Install `@testing-library/user-event`, and promote
      `@testing-library/dom` to a direct devDependency.
- [x] **(done 2026-08-11)** Prove the project actually collects `.tsx`, the jsdom environment is
      active, and the `jest-dom` matchers are registered — done by
      `src/__tests__/rtl/util/ShowHide.rtl.test.tsx`, which is a real test rather than the throwaway
      smoke test this item originally proposed, so nothing has to be deleted.
- [x] **(done 2026-08-11)** Add the missing `package.json` scripts: `test:run`, `test:unit`,
      `test:react`, and `test:coverage`.
- [x] **(done 2026-08-11)** Fix the dead `TZ=UTC` setup: `src/support/global-test-setup.ts` deleted,
      `TZ` now pinned from both per-module setup files.
- [x] **(done 2026-08-11)** Add `src/__tests__/unit/jest.unit.setup.ts` for symmetry.
- [x] **(done 2026-08-11)** Remove `ts-jest` from `devDependencies`.
- [x] **(found and done 2026-08-11, not originally listed)** Add
      `src/__tests__/rtl/jest.rtl.environment.ts`, a jsdom subclass that copies Node's web globals
      into the sandbox. Stock `testEnvironment: 'jsdom'` cannot load any component that imports from
      the `~/components/types` barrel, because the barrel reaches `next/server` and `next/server`
      subclasses the `Request` global at module scope. See [decisions.md](./decisions.md).
- [ ] Build `src/__tests__/support/render.tsx` (`renderWithProviders` wrapping `MantineProvider`,
      re-exporting `@testing-library/react`) **when the first provider-bound RTL test needs it** —
      resolved 2026-08-11 as build-on-first-need rather than build-up-front (see
      [decisions.md](./decisions.md)). Nothing is blocked on it today.
- [ ] Untangle the `~/components/types` barrel so it stops pulling `~/internal/logger` — and through
      it the whole API client and `next/server` — into anything that imports a class-name helper.
      This costs the browser bundle as much as it costs the test suite, and it is what the custom
      test environment currently works around. Belongs to the app-performance project; noted here
      because this project found it.
- [ ] Fix the setup-file glob in
      [`tooling/eslint-config-web/configs/jest.mjs`](../../../tooling/eslint-config-web/configs/jest.mjs):
      `**/jest.*.config.<ext>` requires an infix segment and so matches none of `jest.config.ts`,
      `jest.config.base.ts`, or the module configs. The `SetupFilePatterns` array also lists
      `**/jest.*.setup*` and `**/jest.*.presetup*` twice each. Cosmetic, but it means the config
      files silently do not get the treatment the config intends.

## Unit Test Coverage — Easy Wins

_Not gated on anything. These run under the existing unit project today._

- [x] **(done 2026-08-11)** **`src/lib/fs.ts` — `getFileSize`, `toFileSizeString`.** The predicted
      bug was real. The loop condition `value > bytes && value < nextBytes` was exclusive at both
      ends, so every exact power of 1024 fell through into the final `pb` return —
      `getFileSize(1024)` yielded `['pb', 9.09e-13]` rather than `['kb', 1]`. Four of the eleven
      table cases fail against the old bound; fixed in the same change (see
      [decisions.md](./decisions.md)). Covers sub-1KB, every exact boundary, mid-range values,
      `bigint` input, and the two-decimal uppercase formatting.
- [ ] **`src/lib/formatters/slugify.ts` — `slugify`.** Load-bearing: the company/school bindings and
      `legacy-created-at.ts` derive correlation keys from it, so a behavior change silently
      mis-correlates records. Cover mixed punctuation, leading/trailing/repeated whitespace,
      pre-existing hyphens, uppercase, and the thrown error listing every offending character.
- [ ] **`src/lib/arrays.ts` — `uniq`, `arraysHaveSameElements`, `strictArrayLookup`, `cycle`,
      `tupleCycle`.** Five behaviors in ~80 lines, pure but for lodash `isEqual`. `tupleCycle`'s
      two-index reset drives `generateChartColors` and is genuinely subtle. Cover custom equality
      functions, deep-object dedupe, the duplicate-input throw in `arraysHaveSameElements`,
      out-of-bounds under `strict: true` vs `null`, and exact emission order across several full
      cycles.
- [x] **(done 2026-08-11)** **`src/lib/formatters/humanize-list.ts` — `humanizeList`.**
      Self-contained, four independent options (`conjunction`, `delimiter`, `oxfordComma`,
      `formatter`) crossed with length branches at 0, 1, 2, and ≥3. The oxford comma applying only
      at ≥3 is exactly the off-by-one worth pinning.
- [ ] **`src/components/types/sizes.ts` — the parsers and guards.** Despite living under
      `components/`, this is plain string/number parsing with no React and no DOM, so it belongs in
      the unit lane. Cover `'12px'`/`'1.5rem'`/`'50%'` parsing, unitless numeric strings,
      qualitative names, malformed input returning `[null, null]`, the `strict` escape hatch, and
      unit-preserving round-trips through `sizeToString`.
- [ ] **`src/lib/dates.ts` — `minDate`, `maxDate`.** Four TypeScript overloads over four runtime
      paths (leading `null`, empty rest, single-element rest, reduce), and it relies on `<`/`>`
      working for luxon `DateTime` as well as `Date`. Cover all-null → `null`, nulls interleaved in
      the rest args, each arity, and `DateTime` inputs. The `TZ=UTC` pinning this suite depends on
      is in place as of 2026-08-11.
- [ ] **`src/lib/objects.ts` — `iteratePaths`, `parseValueAtPath`, `flattenObjectPaths`.** Zero
      imports, recursive, three distinct `throw` paths, and an `isNonNullObject` guard that exists
      specifically to paper over a `continueOn` predicate that can classify `null` as an object.
      Cover the empty object, deep nesting, `null` leaves, a predicate that lies, and the "path
      fully traversed" error.
- [x] **(done 2026-08-11)** **`src/database/content/bookkeeping.ts` — `omitBookkeeping`.** Zero
      imports and one `Set`-based filter, but it opens every binding's encode path, so a missed key
      corrupts every transfer. Cover all bookkeeping keys stripped, `extra` keys stripped, unrelated
      keys preserved verbatim (including `undefined` and `null` values), the empty object, and
      non-mutation of the input.
- [ ] **`src/lib/colors.ts` — `hexToRgb`.** A 2×2 option matrix (`format: 'set' | 'string'` × alpha
      present/absent) plus a `strict: false` null path and a throw path. The alpha check is
      `if (opts.alpha)` rather than an `undefined` check, so `alpha: 0` silently degrades to the
      non-alpha branch — a real bug. Cover casing, missing `#`, three-digit hex, `alpha: 0`, and the
      invalid-hex throw.
- [x] **(done 2026-08-11)** **`src/integrations/http/paths.ts` — `withoutLeadingSlashes`,
      `withoutTrailingSlashes`.** Trivially pure, already consumed by `getApplicationUrl`. Six
      assertions each: none, one, many, only-slashes (`'///'` → `''`), and the empty string. The
      cheapest item on this list.
- [ ] **`src/lib/schemas.ts` — `partiallyParseObjectWithSchema`, `NullableStringField`,
      `NonNullableStringField`.** The tolerant parser branches five ways (`undefined` + defaults,
      valid parse, invalid + defaults, invalid without defaults where the key is omitted entirely,
      and the optional `logWhenInvalid` log). Only friction is mocking `~/internal/logger`. Also
      cover the blank-string → `null` transform in both field factories.
- [ ] **`src/lib/filters.ts` — `Filters.parse`, `.prune`, `.areEmpty`, `.add`, `.hasFilter`,
      `.defaultValues`, `.schemas`.** Highest value on this list (551 lines driving every list
      view's URL state) at moderate ease: construct a `Filters` from the four static builders and
      feed it query strings and plain objects. Only `clearRefValue`/`setRefValue` need React, and
      they can be skipped. Cover unknown params ignored, invalid values falling back to defaults,
      `shouldBeExcluded` pruning empty arrays and strings, and `multiString` vs `multiEnum` array
      coercion.
- [ ] Cheap follow-ons worth batching once the above are in: `src/actions/pagination.ts`
      `clampPagination` (the page ceiling is derived from the _unclamped_ count),
      `src/database/content/codecs/meta.ts` encode/decode round-trip plus `MetaSchema.strict()`
      rejection, `src/database/content/issues.ts` `IssueCollector` severity partitioning and
      `assertValid` message formatting, and `src/lib/formatters/capitalize.ts` (`capitalize('')`
      throws on `s[0].toUpperCase()`).
- [ ] Export and test the module-private pagination math in
      `src/components/pagination-v2/Paginator.tsx` — `getPaginatorTotal` and `getActivePage` clamp
      page size to 1–100, floor the total at 1, and fall back to page 1 on an invalid `?page=`. This
      is the highest-value pagination coverage available and needs no RTL at all; it is only
      inaccessible because the helpers are not exported.

## RTL Test Coverage — Easy Wins

_Hard-gated on the Jest Configuration & Setup section. Every item below was chosen to need **no**
provider wrapper, no router mock, no SWR, and no auth._

- [ ] **`src/components/input/select/MultiValueRenderer/TruncatedMultiValueRenderer.tsx`.** A pure
      `memo` with a four-branch partition/summarization tree over `content`,
      `maximumValuesToRender`, `summarizeValue`, and `summarizeValueAfter`; deps are `react-is` and
      `Text`. Assert: first N children plus a "3 More..." summary; only "5 Selected..." once
      `summarizeValueAfter` is exceeded; `null` on empty content; `null` in the edge case where
      `partition[0]` is empty but `partition[1]` is not.
- [ ] **`src/components/structural/Collapse.tsx`.** The best interaction candidate in the repo: a
      full controlled/uncontrolled dual API (`isOpen` overrides `internalIsOpen`), `isEnabled`
      gating, and a `role='button'` header with keyboard handling. Only external dep is
      framer-motion, which renders in jsdom. Assert with `user-event`: click toggles content and
      `aria-expanded`; Enter and Space do the same; `isEnabled={false}` blocks the toggle entirely;
      controlled `isOpen` ignores internal state while `onOpenChange` still fires with the negation.
- [x] **(done 2026-08-11)** **`src/components/typography/Title.tsx`.** `getTitleComponent` maps
      `fontSize` to a heading level through `TitleFontSizeOrderMap`, defaulting to `h3`, with an
      explicit `component` prop winning. Assert each discrete size via
      `getByRole('heading', { level: N })`, the override, and the default — a clean introduction to
      role-based querying.
- [x] **(done 2026-08-11)** **`src/components/structural/Actions.tsx`.** Also the suite that proves
      `user-event` works end to end. Filters falsy actions and Fragments, returns `null` when
      nothing survives, accepts either an `actions` array or `children`, and stops click
      propagation. Assert `null` for `[]` and `[null, false, undefined]`, exactly the valid actions
      rendered, and that a child action's click fires its own handler without reaching a parent
      `onClick`.
- [ ] **`src/components/typography/PipedText.tsx`.** Drops null/undefined children, returns `null`
      if none remain, interleaves a pipe `Icon` between every pair but not after the last. Assert N
      children → N−1 pipes, nulls dropped before the count, a single child → zero pipes, all-null →
      nothing.
- [ ] **`src/components/badges/Badge.tsx`.** Conditional `Icon` (string/`IconProp`) vs. a raw JSX
      element, a conditional close `IconButton`, and `cursor-pointer` only when `onClick` is set;
      variant/size/radius emitted as data attributes. Assert `data-attr-size`/`data-attr-radius`
      reflect props, the close button appears only with `onClose` and its click calls `onClose`
      without triggering the badge's own `onClick`, and a JSX `icon` renders verbatim.
- [ ] **`src/components/buttons/generic/AbstractButton.tsx`.** The polymorphic base of a
      37-component button stack — the single highest-leverage RTL test here. It switches on
      `element` between `button`/`a`/`div`/next `Link`, strips seventeen internal props from the
      native DOM props, and layers locked/loading/disabled/active class names. Uses `next/link` but
      no router hooks, so no mocking. Assert `disabled` from `isDisabled`; `element='a'` +
      `openInNewTab` sets `target='_blank'` and `rel='noopener noreferrer'`; internal props like
      `isLocked` never leak to the DOM as raw attributes; state class names apply only in their
      state.
- [x] **(done 2026-08-11)** **`src/components/util/ShowHide.tsx`.** A memoized discriminated union
      where `show` and `hide` are two different render contracts. Four assertions, and it is the
      primitive `Empty` and `Loading` are built on, so it de-risks both.
- [ ] **`src/components/icons/CircleNumber.tsx`.** Clamps `size` into `[12, 64]`, derives
      `lineHeight` as `size - 4`, swaps class names on `isActive`. Assert `size={4}` and
      `size={200}` both clamp in the inline style, the active/inactive class swap, and that the
      number renders as text.
- [ ] **`src/components/typography/ReplacedSubstrings.tsx`.** Case-insensitive substring
      highlighting via `html-react-parser`, with early bailouts for empty children, empty substring,
      and no match. Assert a match wraps only the matched run while preserving original casing,
      multiple occurrences all wrap, non-matching input renders raw with no extra spans, and an
      empty substring short-circuits.
- [ ] **`src/components/tables/generic/TableSkeleton.tsx`.** Count-driven markup: `numRows` ×
      `numColumns` defaulting to 25×5, a `component='tbody'` vs `'fragment'` branch, and a
      `cellSkeletons` override. Assert the defaults, explicit counts, `cellSkeletons` length winning
      over `numColumns`, and that the fragment variant emits no `<tbody>`.
- [ ] **`src/components/forms-v2/Field/FieldErrors.tsx`.** Merges `form.fieldErrors[name]` with
      caller-supplied `errors` (form errors first) and returns `null` when empty. `FormInstance` can
      be a plain object literal — no react-hook-form setup needed. Assert merge order, `null` on
      empty, and the explicit-errors-only variant. Pairs with the near-identical
      `src/components/forms-v2/FormErrors.tsx`.
- [ ] Same-tier follow-ons once the above are in: `tags/Tag.tsx`, `loading/Skeleton.tsx`,
      `icons/Spinner.tsx` (renders `null` unless `isLoading`), `util/Square.tsx`, the children vs.
      no-children branches of `feedback/Empty.tsx` and `loading/Loading.tsx`, and
      `buttons/generic/ButtonContent.tsx` (`parseIconsAndLoadingLocation` defaults the loading
      location left or right depending on which icon exists — worth asserting, though the icon prop
      types make setup fiddlier).

## Hooks

_Gated on the RTL module project, since `renderHook` needs the jsdom environment._

- [ ] **`src/hooks/use-resettable-state.ts` — `useResettableState`.** The best hook candidate:
      assert the lazy initializer runs once, `hasChanged` flips via `isEqual`, `reset` restores the
      initial value, and the captured initial stays frozen across updates.
- [ ] **`src/hooks/use-id.ts` — `useId`.** Assert an invalid initial value yields `null`,
      `setValidatedId` ignores non-UUIDs, and `null` is always accepted.
- [ ] **`src/hooks/use-debounced-callback.ts` and `use-debounced-value.ts`.** Fake-timer tests for
      leading/trailing/`maxWait` and the custom `equalityFn` path.
- [ ] **`src/hooks/use-deep.ts` (`useDeepEqualEffect`) and `use-unmount.ts`.** Assert the effect
      does not re-run for a deep-equal-but-new-reference dep array; assert the unmount callback
      fires exactly once and reads the latest function.
- [ ] **`src/hooks/use-filter-state.ts` and `use-referential-callback.ts`.** Both are marked
      `@deprecated` — test them only if they are staying. `useFilterState`'s per-key comparator
      logic makes a nice table-driven suite; `useReferentialCallback` asserts stable identity across
      renders while reading the latest closure values.
- [ ] `src/hooks/use-window-resize.ts` and `use-screen-sizes.ts` need a `window.resize` dispatch and
      a `ResizeObserver` polyfill in the RTL setup file. Worth doing once, because
      `useContainerSizes` currently blocks any test of `BadgeCollection`'s truncation branch.

## Conventions & Enforcement

- [ ] Write down the testing conventions as a rule file under `.claude/rules/` (and its
      `.github/instructions/` mirror, via the `sync-ai-config` skill) once enough tests exist to
      have actual conventions: `it` over `test`, `describe` named for the function under test with
      parens, `it.each` with typed `Case` tuples, role-first queries, no snapshot tests by default.
      The existing `src/__tests__/unit/database/content/diff.unit.test.ts` is the current best
      exemplar.
- [ ] Decide whether `test:ci` should actually run somewhere. There is no `.github/workflows/`
      directory at all, and Vercel's build runs only `prisma generate && next build`, so nothing
      executes the suite automatically today. Gated on the CI question in
      [open-questions.md](./open-questions.md).
- [ ] Once the suite is non-trivial, evaluate coverage reporting — reporting only at first. Gated on
      the thresholds question in [open-questions.md](./open-questions.md).

## Deferred — Out of Scope for Now

_Recorded so they are not re-proposed. See [decisions.md](./decisions.md) for the scope boundary._

- [ ] **(deliberately deferred — do not prioritize)** API route handler tests for `src/app/api/**`.
      Needs a request/response fixture strategy and a mocking layer (`msw` or otherwise) that this
      project is not taking on.
- [ ] **(deliberately deferred — do not prioritize)** Prisma-backed integration tests and
      server-action tests. Needs a database lifecycle (test database, migrations, truncation between
      tests) that is a project of its own.
- [ ] **(deliberately deferred — do not prioritize)** End-to-end/browser tests. No Playwright or
      Cypress dependency exists, and adding one is a separate decision.
- [ ] Provider-bound RTL tests: everything behind `DrawersProvider`, the `Connected*`/`Data*` table
      components behind `DataTableProvider`, `menus/DataMenu*`, the floating-ui `Popover`/`Tooltip`
      stack, `dialogs/Dialog`, `tours/*`, `uploads/*`, and `charts/BarChart.tsx`. Unblocked
      incrementally by the `renderWithProviders` item above, not by this project's charter.
- [ ] Components importing `next/navigation`, Clerk, SWR, or server actions: both `Paginator`s,
      `DetailVisibilityButton`, `GithubButton`, `LinkedInButton`, `DeleteConfirmationDialog`,
      `layout/Header/*`, `TableControlBar*`, the checkbox/select table cells, and the hooks
      `use-filters`, `use-ordering`, `use-navigation`, `use-nav-menu`, and everything in
      `src/hooks/api/`. These need a router/auth mocking strategy that has not been chosen.
