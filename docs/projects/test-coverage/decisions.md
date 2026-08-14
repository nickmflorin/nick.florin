# Decision Log

Every non-trivial decision made on this project gets an entry here, newest first. Each entry records
the decision, the date, the reasoning, and any alternatives that were rejected. This is the file to
consult before re-opening a settled question.

Format:

```markdown
## YYYY-MM-DD — Short decision title

**Decision:** What was decided. **Why:** The reasoning. **Alternatives considered:** What was
rejected and why (omit if none).
```

---

## 2026-08-11 — Test file names carry their module: `.unit.test.ts` and `.rtl.test.tsx`

**Decision:** Every test file is named for the module that runs it — `<subject>.unit.test.ts` for
unit tests, `<subject>.rtl.test.tsx` for RTL tests — and each module's `testMatch` requires its own
infix. The four pre-existing test files and the two untracked sync-engine ones were renamed with the
rest, so there is no legacy set on the old convention. The Jest module itself is named `rtl` rather
than `component`, with the `rtl-tests` display name and the `test:react` script.

**Why:** The suffix says which environment and which ruleset a file runs under, at the only place a
reader looks first. It also makes the two `testMatch` globs total and non-overlapping, so a file
cannot be picked up by the wrong project, and it keeps `--selectProjects` honest.

**Limitation:** The infix is load-bearing and a wrong one fails **silently** — a `fs.test.ts` in the
unit directory matches no `testMatch`, so Jest neither runs it nor warns, and the suite goes green
having skipped it. That is the same trap the original `.tsx`-excluding configuration had. It is
documented in [jest-setup.md](./jest-setup.md); a lint rule that catches a test file collected by no
project would be the real fix.

**Alternatives considered:** Plain `.test.ts`/`.test.tsx` with the directory alone assigning the
module (rejected: it reads identically in an editor tab, a search result, or a stack trace, and
`.test.tsx` in the unit directory would be silently skipped in exactly the same way while looking
correct). Naming the module `component` rather than `rtl` (rejected on the developer's call: the
suite is defined by the tool it uses, and "component test" collides with "React component" in every
sentence that has to mention both).

---

## 2026-08-11 — The RTL suite runs in a custom jsdom environment, not stock `'jsdom'`

**Decision (implementation record):** `src/__tests__/rtl/jest.rtl.environment.ts` subclasses
`jest-environment-jsdom` and copies Node's `fetch`, `FormData`, `Headers`, `ReadableStream`,
`Request`, `Response`, `TextDecoder`, `TextEncoder`, and `TransformStream` into the sandbox, guarded
by an `in` check so jsdom's own implementations are never overwritten. The RTL project points
`testEnvironment` at that file rather than at the string `'jsdom'`.

**Why:** Stock jsdom cannot load a component from this codebase at all. Importing anything from the
`~/components/types` barrel — including `classNames`, which nearly every component uses — reaches
`~/internal/logger`, then `~/api`, then `next/server`, which subclasses the `Request` global at
module scope. jsdom does not implement `Request`, so the import throws
`ReferenceError: Request is not defined` before any assertion runs. A test environment module is
evaluated in the Node realm rather than in the sandbox it constructs, which is the only place in the
suite where Node's implementations are reachable, so the copy has to happen there.

**Limitation:** This is a workaround for a barrel that reaches too far, not a fix. The real defect
is that `~/components/types` pulls the logger and the whole API client into anything importing a
class-name helper, which costs the browser bundle exactly as much as it costs the test suite.
Untangling it belongs to the app-performance project.

**Alternatives considered:** Polyfilling from the setup file (rejected: setup files run inside the
sandbox, where Node's globals are already gone). Adding `undici` as a direct dependency to import
the classes from (rejected: it duplicates what Node already ships, and pins a second copy of the
same implementation). Mocking `~/internal/logger` per test file (rejected: every RTL test would
carry a `jest.mock` for a module it has no interest in, and the mock would have to be maintained
against the logger's shape).

---

## 2026-08-11 — RTL tests mirror the source tree under `src/__tests__/rtl/`

**Decision:** RTL test files live at `src/__tests__/rtl/<path>/<Component>.rtl.test.tsx`, where
`<path>` is the component's path under `src/components/` with the leading `components/` segment
dropped — so `src/components/structural/Actions.tsx` is tested by
`src/__tests__/rtl/structural/Actions.rtl.test.tsx`. Test files are **not** colocated with the
components they test. This resolves the first open question.

**Why:** It keeps one convention in the repository rather than two. Every existing test already
mirrors the source tree under `src/__tests__/`, and the per-module Jest projects root their
`testMatch` at their own `__dirname`, which the mirrored layout fits without further configuration.
Dropping the redundant `components/` segment avoids the doubled `src/__tests__/rtl/components/` path
that a literal mirror would produce.

**Alternatives considered:** Colocation next to the component (rejected: it is the more common React
convention, but it would put `.test.tsx` files inside directories that are otherwise entirely
shipped code, and it would leave the repository running two different conventions for the two test
modules with nothing to recommend either).

---

## 2026-08-11 — `renderWithProviders` is built on first need, not up front

**Decision:** No shared provider-wrapped `render` helper is created yet. RTL tests import `render`
and `screen` from `@testing-library/react` directly. The helper is added — at
`src/__tests__/support/render.tsx`, re-exporting everything from `@testing-library/react` — the
first time a test needs a component that requires `MantineProvider` or another provider in the tree.
This resolves the second open question.

**Why:** All twelve seeded RTL items, and all three that landed, were chosen specifically to need no
provider, so a helper built now would have no consumer to shape it. The migration cost that would
argue for building it up front is small and mechanical: when the helper arrives, the import
specifier in the existing test files changes and nothing else does, because the helper re-exports
the same API.

**Alternatives considered:** Building it immediately so every test imports from one place from day
one (rejected: it guesses at a shape with no case to check the guess against, and the thing being
avoided is a one-line import change in a handful of files).

---

## 2026-08-11 — `getFileSize` claimed the wrong unit at every exact power of 1024

**Decision (implementation record):** The unit scan in `src/lib/fs.ts` used an exclusive lower
bound, `value > bytes && value < nextBytes`. It is now inclusive, `value >= bytes`.

**Why:** With the exclusive bound, a value equal to a unit boundary matched no iteration and fell
through to the function's final `return`, which reports petabytes unconditionally. A file of exactly
1024 bytes was reported as `['pb', 9.09e-13]`, and `toFileSizeString(1024 ** 3)` rendered `0.00 PB`
instead of `1.00 GB`. Every exact kilobyte, megabyte, gigabyte, and terabyte was affected — four of
the eleven cases in the new `getFileSize` table fail against the old bound, and they were written
before the fix rather than after it. The only consumer is `src/components/typography/FileSize.ts`,
which is display-only, so the correction has no other blast radius.

**Alternatives considered:** None — the inclusive bound is what the surrounding code already
assumes; `value < K_UNIT` above the loop makes the boundary case for bytes the same way.

---

## 2026-08-11 — Scope is unit tests and RTL tests; API tests are out

**Decision:** This project covers exactly two kinds of test. **Unit tests** — pure functions, node
environment, no DOM, no I/O, no database — and **RTL tests** — React Testing Library under jsdom, no
network, no auth. API route handler tests, server-action tests, Prisma-backed integration tests, and
end-to-end/browser tests are explicitly out of scope and are recorded in the Deferred section of
[backlog.md](./backlog.md) so they are not re-proposed.

**Why:** The two in-scope kinds share one property that the excluded kinds do not: they need no
external lifecycle. A pure function test needs nothing, and a RTL test needs jsdom and a `render`
call. Everything excluded needs a decision about a test database (creation, migration, truncation
between tests) or about a request-mocking layer, and each of those is a project-sized question in
its own right. Bundling them would stall the cheap work behind the expensive work, and the cheap
work is precisely what the repository is missing — seven test files and zero React tests. The Jest
project architecture in [jest-setup.md](./jest-setup.md) is deliberately built so that an API or
integration suite can later be added as a third `TestModule` without disturbing these two.

**Alternatives considered:** Including API route handler tests (rejected: forces an immediate
`msw`-or-not decision and a request/response fixture convention before a single RTL test exists).
Starting with end-to-end tests on the grounds that they cover the most per test (rejected: no
Playwright or Cypress dependency exists, the runtime cost is high, and a failing e2e test does not
localize the defect — it is the wrong first instrument for a codebase with no test habit).

---

## 2026-08-11 — The existing per-module Jest project architecture is kept, not replaced

**Decision:** The RTL suite is added as a second Jest **project** through the existing `TestModule`
/ `withModuleConfig` machinery in [`jest.config.base.ts`](../../../jest.config.base.ts), rather than
by flattening everything into a single configuration or introducing a parallel setup.

**Why:** The unit and RTL suites genuinely need different `testEnvironment` values, different
`testMatch` globs, and different setup files — which is exactly what Jest projects exist for. The
architecture is already in place and already correct; it simply has one member in its enum. Adding a
second one is a new enum entry, a config directory, and a setup file. A flattened single config
would either force jsdom onto the pure-function suite (slower, and it masks accidental DOM
dependencies in code that should have none) or force `.tsx` collection into a node environment.

**Alternatives considered:** One config with `testEnvironmentOptions` and per-file
`@jest-environment` docblocks (rejected: pushes the environment decision into every individual test
file, where it will be forgotten, and gives up the `displayName`-scoped `--selectProjects` runs).
