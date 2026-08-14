# Project Status

_Last updated: 2026-08-11_

## Phase

**Phase 1 — Harness built, first tests landed (2026-08-11).** The RTL (React Testing Library) Jest
project exists and runs, the configuration defects found during the audit are fixed, and seven
starter test files are in — four unit and three RTL. The suite is **14 files, 187 tests, all
passing**, up from 7 files and 163 tests. The remaining backlog items are coverage, not
infrastructure; the one deliberate infrastructure gap is `renderWithProviders`, held until a
Mantine-bound component actually needs it.

## Done

- 2026-08-11: Project folder created; the current Jest setup audited and the target module structure
  documented in [jest-setup.md](./jest-setup.md); backlog seeded with the configuration items and
  the unit/RTL easy wins; the unit-vs-RTL scope boundary recorded in [decisions.md](./decisions.md);
  open questions recorded; registered in `docs/index.md`.
- 2026-08-11: **The RTL test project is built and green.** `TestModule` gained an `rtl` member with
  the `rtl-tests` display name; `src/__tests__/rtl/` carries its own `jest.config.ts` (jsdom,
  `*.rtl.test.tsx`), `jest.rtl.setup.ts` (registers `@testing-library/jest-dom`, pins `TZ`), and a
  custom `jest.rtl.environment.ts`. Both projects run under one `jest` invocation.
- 2026-08-11: **Stock `testEnvironment: 'jsdom'` turned out to be insufficient**, and this was found
  by running the suite rather than by reading the config. Importing anything from the
  `~/components/types` barrel reaches `~/internal/logger` → `~/api` → `next/server`, which
  subclasses the `Request` global at module scope; jsdom does not implement it, so two of the three
  RTL suites failed to load. Resolved with a custom environment that copies Node's web globals into
  the sandbox — see [decisions.md](./decisions.md) and [jest-setup.md](./jest-setup.md).
- 2026-08-11: Configuration defects from the audit fixed. `@testing-library/user-event` and
  `@testing-library/dom` installed as direct devDependencies; the unreachable `ts-jest` removed; the
  dead `src/support/global-test-setup.ts` deleted and its `TZ=UTC` intent reinstated through
  per-module setup files (the unit project had none at all before); `test:run`, `test:unit`,
  `test:react`, and `test:coverage` added to `package.json`.
- 2026-08-11: **Four unit test files landed** — `lib/fs`, `lib/formatters/humanize-list`,
  `integrations/http/paths`, and `database/content/bookkeeping`.
- 2026-08-11: **Three RTL test files landed** — `util/ShowHide` (proves the harness end to end),
  `typography/Title` (role-based querying against the `TitleFontSizeOrderMap` heading mapping), and
  `structural/Actions` (proves `user-event` and the click-propagation guard).
- 2026-08-11: **A live bug was found and fixed in `src/lib/fs.ts`**, exactly as the backlog
  predicted. See [decisions.md](./decisions.md).
- 2026-08-11: **Test file naming settled**: `<subject>.unit.test.ts` and `<subject>.rtl.test.tsx`,
  with each module's `testMatch` requiring its own infix. All eleven unit test files were renamed,
  including the four that predate this project and the two untracked sync-engine ones, so nothing is
  left on the old convention. The Jest module is `rtl` (display name `rtl-tests`, script
  `test:react`) rather than `component`.
- 2026-08-11: **ESLint is clean on every new file.** One real finding, on the `ShowHide` suite:
  `testing-library/no-node-access` against a `container.firstElementChild` assertion, rewritten to
  assert `container.innerHTML` instead. Confirmed with `eslint --print-config` that the test ruleset
  genuinely applies to the new names — 63 `jest/*` rules and 22 `testing-library/*` rules — so the
  clean run means the files comply rather than that no rules were checked.

## In Progress

- Nothing. The harness is complete and the first coverage is in; the next item is picked off
  [backlog.md](./backlog.md).

## Next

1. Continue down the Unit Test Coverage section of [backlog.md](./backlog.md). `slugify` and
   `arrays` are the next two by value, and `filters` is the highest-value item on the list whenever
   there is appetite for a larger one.
2. Continue down the RTL Test Coverage section. `AbstractButton` is the highest-leverage remaining
   item — it is the base of a 37-component stack — and `Collapse` is the one that proves
   controlled/uncontrolled and keyboard interaction.
3. Settle the CI question in [open-questions.md](./open-questions.md). It matters more now than it
   did before: there are 187 tests and still nothing that runs them automatically.
4. Write the testing conventions down as a rule file once a few more tests exist. The seven new
   files establish a house style (`describe('<Component />')` for components, `it.each` with a typed
   `Case` tuple, role-first queries) that is currently only implicit.
