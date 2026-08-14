# Test Coverage Project — Working Context

This folder is the persistent working context for the test coverage project: building out a real
Jest setup for unit and RTL (React Testing Library) tests, and then actually using it — moving the
repository from seven test files to meaningful coverage of the code that breaks. It exists so that
any session (human or AI) can pick up exactly where the last one left off. **Read this file first,
then [status.md](./status.md).**

## What This Project Is

The repository had testing infrastructure in name only. Jest was configured,
`@testing-library/react` and `@testing-library/jest-dom` were installed, `eslint-plugin-jest` and
`eslint-plugin-testing-library` were wired into the lint config — and none of it was used. There
were **seven test files**, all of them plain `.test.ts` unit tests, and **zero React tests**; the
Jest configuration could not have run one if it existed, because it had no jsdom environment, its
`testMatch` excluded `.tsx`, and no setup file registered the `jest-dom` matchers.

As of 2026-08-11 the harness exists and the first coverage is in — see [status.md](./status.md) for
where that stands. The remaining work is coverage, not infrastructure.

The project's charter:

1. **Make the Jest setup real.** Extend the existing `TestModule` project architecture in
   [`jest.config.base.ts`](../../../jest.config.base.ts) with a second module for RTL tests — jsdom
   environment, `.tsx` collection, a setup file registering `@testing-library/jest-dom`, and a
   shared provider-wrapped `render`. The per-module project structure that already exists is the
   right shape; it is simply half-built. The target configuration is written up in
   [jest-setup.md](./jest-setup.md).
2. **Start testing heavily.** Coverage is not a number to chase here, but the current level is
   indefensible for a codebase with a filter DSL, a content sync engine, a polymorphic button
   system, and a resume generation pipeline. The work is to build momentum with cheap, high-value
   tests first, so that writing a test stops being a project of its own.
3. **Seed both lanes with easy wins.** Concrete, pre-scoped starter tests for pure `src/lib`
   utilities and for presentational components, listed in [backlog.md](./backlog.md), so that no
   session has to spend its budget deciding what to test.

**Explicitly out of scope:** API route handler tests, Prisma-backed integration tests, server-action
tests, and end-to-end/browser tests. This project covers **unit tests** (pure functions, no DOM, no
I/O) and **RTL tests** (React Testing Library, jsdom, no network). Everything else is a separate
conversation — see [decisions.md](./decisions.md).

## Files in This Folder

| File                                     | Purpose                                                          |
| ---------------------------------------- | ---------------------------------------------------------------- |
| [status.md](./status.md)                 | Current state: what's done, in progress, and next. Update often. |
| [decisions.md](./decisions.md)           | Decision log. Every non-trivial decision gets an entry.          |
| [backlog.md](./backlog.md)               | Running checklist of work items, organized by area               |
| [open-questions.md](./open-questions.md) | Unresolved questions that need discussion/decisions              |
| [jest-setup.md](./jest-setup.md)         | Current Jest configuration, its gaps, and the target structure   |

## Working Conventions for This Project

- **Update as you go.** When a work session makes progress or a decision, update `status.md`,
  `backlog.md` (check items off, add new ones), and (if applicable) `decisions.md` before finishing.
  Stale context is worse than no context.
- **Dates are absolute.** Never write "yesterday" or "last week" in these files.
- **Configuration comes before coverage.** No RTL test is written until the RTL module project in
  [jest-setup.md](./jest-setup.md) exists and a trivial smoke test passes under it. Writing tests
  against a configuration that has to change underneath them wastes both.
- **A test asserts behavior, not implementation.** RTL tests query by role and accessible name
  before they query by class or test id, and they never assert on internal state or on the shape of
  a `className` string. A test that breaks when the markup is refactored but the behavior is
  unchanged is a liability.
- **A failing test on an easy win is a finding, not a blocker.** Several of the seeded unit-test
  candidates are believed to contain live bugs (see [backlog.md](./backlog.md)). When a test
  confirms one, record it in [decisions.md](./decisions.md) and fix it in the same change — but do
  not let a discovered bug expand into unrelated refactoring.
- **Items are independent.** Each backlog item lands on its own branch/PR. Test files are the least
  entangled code in the repository; there is no reason to bundle them.
