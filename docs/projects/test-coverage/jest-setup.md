# Jest Setup — Architecture and Rationale

This document records how the Jest configuration is put together and why. The "Why a React Test
Could Not Run" section below describes the state before 2026-08-11 and is kept because each gap it
lists explains a piece of the configuration that now exists.

## The Existing Architecture Is Right

The repository already uses the correct pattern: Jest **projects**, one per test module, each with
its own configuration file, composed by a shared base. That is the shape worth keeping — it is what
allows a node-environment unit suite and a jsdom-environment RTL suite to run in the same `jest`
invocation with different environments, different setup files, and different `testMatch` globs,
without either one paying for the other's overhead.

Four files carry it:

| File                                | Role                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `jest.config.ts`                    | Application config. Calls `withApplicationConfig(__dirname, [...projects])` with the list of module config paths.                   |
| `jest.config.base.ts`               | The shared base. Exports `TestModule`, `TestModuleDisplayNames`, `withBaseConfig`, `withModuleConfig`, and the `next/jest` wrapper. |
| `src/__tests__/unit/jest.config.ts` | The unit module project. Node environment, `testMatch: ['**/*.unit.test.ts']`.                                                      |
| `src/__tests__/rtl/jest.config.ts`  | The RTL module project. Custom jsdom environment, `testMatch: ['**/*.rtl.test.tsx']`.                                               |

Both module projects remap `lodash-es` → `lodash` through `moduleNameMapper`, because the ESM build
is not transformed for the test runtime.

`withModuleConfig` is the seam. It already stamps a `displayName` from the `TestModule` enum and
already appends to `setupFilesAfterEnv`:

```typescript
export const withModuleConfig = (rootDir: string, { module, ...config }: ModuleConfig) => {
  const resulting = createNextJestConfig(
    withBaseConfig(rootDir, {
      ...config,
      displayName: TestModuleDisplayNames[module],
      setupFilesAfterEnv: [...(config.setupFilesAfterEnv ?? []), 'jest-expect-message'],
    }),
  );
  return resulting;
};
```

Adding an RTL suite is therefore not a rewrite. It is a new enum member, a new module config
directory, and a setup file.

## Why a React Test Could Not Run

Five concrete gaps, in the order they bit. All five are closed as of 2026-08-11:

1. **`testMatch` excludes `.tsx`.** The unit project matches `${__dirname}/**/*.test.ts` only. A
   `Badge.test.tsx` is silently never collected — no error, no test, a green run.
2. **No `testEnvironment` is set anywhere.** `next/jest` does not default to jsdom, and neither
   `withBaseConfig` nor the unit project sets it, so everything runs in node. `render()` would throw
   on `document`.
3. **No setup file exists.** The only `setupFilesAfterEnv` entry is the string
   `jest-expect-message`. `@testing-library/jest-dom` is installed but never imported, so
   `toBeInTheDocument`, `toHaveAttribute`, and the rest are neither registered at runtime nor
   present in the type declarations.
4. **`@testing-library/user-event` is not installed.** Interaction tests — the ones actually worth
   writing for `Collapse`, `Checkbox`, and the button stack — need it. Firing raw `click` events via
   `fireEvent` is a worse default.
5. **`@testing-library/dom` is not a direct dependency.** It resolves today only as a hoisted peer
   of `@testing-library/react`, so under pnpm's strict linking a direct
   `import { within } from '@testing-library/dom'` will fail. Re-exports through
   `@testing-library/react` work; direct imports do not.

Two further defects are worth fixing while in there:

- **`globalTestSetup` is dead code.** `src/support/global-test-setup.ts` exists to pin `TZ=UTC`, but
  nothing imports it and `AllowedConfig` explicitly `Omit`s `globalSetup`, so no module project is
  even permitted to wire it up. Date-sensitive assertions currently depend on the machine's
  timezone. The fix is to set `process.env.TZ` from the per-module setup file rather than to
  reintroduce a `globalSetup` hook.
- **`ts-jest` is installed and unused.** `next/jest` supplies the SWC transform, and `transform` is
  in the `Omit` list, so `ts-jest` can never be reached. It is dead weight in `devDependencies`.

## The Structure As Built

Landed 2026-08-11. The `renderWithProviders` helper is the one piece deliberately not built yet —
see [decisions.md](./decisions.md).

```text
jest.config.ts                             # lists both module projects
jest.config.base.ts                        # TestModule carries `rtl` and `unit`
src/__tests__/
├── unit/
│   ├── jest.config.ts                     # node env, *.unit.test.ts
│   └── jest.unit.setup.ts                 # TZ
└── rtl/
    ├── jest.config.ts                     # custom jsdom env, *.rtl.test.tsx
    ├── jest.rtl.environment.ts            # jsdom + Node's web globals
    └── jest.rtl.setup.ts                  # jest-dom matchers, TZ
```

The RTL module project:

```typescript
import { TestModule, withModuleConfig } from '../../../jest.config.base';

export default withModuleConfig(__dirname, {
  module: TestModule.rtl,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  setupFilesAfterEnv: [`${__dirname}/jest.rtl.setup.ts`],
  testEnvironment: `${__dirname}/jest.rtl.environment.ts`,
  testMatch: [`${__dirname}/**/*.rtl.test.tsx`],
});
```

And its setup file:

```typescript
import '@testing-library/jest-dom';

process.env.TZ = 'UTC';
```

### Test File Names Carry Their Module

Each module's `testMatch` requires the module's own infix, so the file name is what assigns a test
to a project:

```text
src/__tests__/unit/lib/fs.unit.test.ts               # collected by unit-tests
src/__tests__/rtl/util/ShowHide.rtl.test.tsx         # collected by rtl-tests
```

The infix is **load-bearing, and getting it wrong fails silently**. A `fs.test.ts` sitting in the
unit directory matches no `testMatch`, so Jest neither runs it nor reports it — the suite goes green
having skipped the file entirely. This is the same failure the original configuration had with
`.tsx`, which is why it is worth stating rather than leaving to be discovered:

```text
Correct: collected, and unmistakably a unit test.
  src/__tests__/unit/lib/fs.unit.test.ts

Disallowed: silently never collected. No error, no test, a green run.
  src/__tests__/unit/lib/fs.test.ts
```

The naming stays compatible with the lint configuration, which matters because that is where the
`jest/*` and `testing-library/*` rules come from. Its globs are `**/*.test.ts` and `**/*.test.tsx`,
and a leading `*` absorbs the infix, so `fs.unit.test.ts` and `ShowHide.rtl.test.tsx` both still
receive the full test ruleset — 63 `jest/*` rules and 22 `testing-library/*` rules, confirmed with
`eslint --print-config`.

### Stock jsdom Is Not Enough

`testEnvironment: 'jsdom'` alone does not survive first contact with this codebase. Importing
anything from the `~/components/types` barrel reaches `~/internal/logger`, which reaches `~/api` and
in turn `next/server` — and `next/server` subclasses `Request` at module scope, a global jsdom does
not implement. Merely rendering a component that imports `classNames` therefore fails before a
single assertion runs:

```text
ReferenceError: Request is not defined

  at Object.<anonymous> (../../api/errors/abstract-api-client-error.ts:11:17)
  at Object.<anonymous> (../../internal/logger.ts:11:21)
  at Object.<anonymous> (../../components/types/breakpoints.ts:59:17)
  at Object.<anonymous> (../../components/structural/Actions.tsx:15:16)
```

A test environment module is evaluated in the Node realm rather than in the sandbox it constructs,
which is what makes Node's own implementations reachable there and nowhere else in the suite. The
environment subclasses the jsdom one and copies them across:

```typescript
import JsdomEnvironment from 'jest-environment-jsdom';

const MissingWebGlobals = { fetch, FormData, Headers, Request, Response /* ... */ };

export default class RtlTestEnvironment extends JsdomEnvironment {
  public async setup(): Promise<void> {
    await super.setup();
    for (const [name, value] of Object.entries(MissingWebGlobals)) {
      if (!(name in this.global)) {
        Object.defineProperty(this.global, name, { configurable: true, value, writable: true });
      }
    }
  }
}
```

The `name in this.global` guard matters: jsdom implements some of these already, and overwriting its
versions with Node's would break `instanceof` checks against jsdom's own constructors.

This is a workaround for a barrel that reaches too far, not a permanent fix. The underlying defect
is that `~/components/types` pulls the logger — and therefore the whole API client — into anything
that imports a class-name helper, which costs the browser bundle as much as it costs the test suite.
Untangling that belongs to the app-performance project; the environment keeps the RTL suite running
in the meantime.

### Setup File Names Are Not Arbitrary

The Jest lint config at
[`tooling/eslint-config-web/configs/jest.mjs`](../../../tooling/eslint-config-web/configs/jest.mjs)
matches setup files with the glob `**/jest.*.setup.<ext>` — note the **required infix segment**.
`jest.setup.ts` does not match; `jest.rtl.setup.ts` does. Naming the files `jest.<module>.setup.ts`
is what gets them the `no-console: off` and type-import rules that the config intends for them.

The same glob quirk means `**/jest.*.config.<ext>` matches `jest.unit.config.ts` but **not**
`jest.config.ts` or `jest.config.base.ts` — so none of the three real config files currently receive
the jest-config lint treatment. That is a pre-existing wart, not a blocker; worth a separate cleanup
item.

### The Provider Wrapper

Roughly a third of the interesting components — `Checkbox`, `Radio`, `RadioGroup`, `Timeline`, the
uploads and dropzone stack — render through Mantine and need `MantineProvider`
(`src/components/config/MantineProvider.tsx`) in the tree. A single `renderWithProviders` in
`src/__tests__/support/render.tsx` that wraps the tree and re-exports everything from
`@testing-library/react` unlocks all of them at once, and gives later provider needs
(`DrawersProvider`, `DataTableProvider`) one place to be added.

The starter RTL tests listed in [backlog.md](./backlog.md) are deliberately chosen to need **none**
of it, so the wrapper is not on the critical path — see the open question about whether to build it
up front.

## Scripts

`package.json` defined exactly two test scripts — `test` (watch-only) and `test:ci` — so there was
no way to run the suite once locally, no way to run one module, and no coverage script. Four scripts
were added alongside them on 2026-08-11:

| Script          | Command                            | Why                                                                                |
| --------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `test:run`      | `jest`                             | A single non-watch local run. `test` being watch-only makes it useless in scripts. |
| `test:unit`     | `jest --selectProjects unit-tests` | Run one module. `displayName` is already set up for exactly this.                  |
| `test:react`    | `jest --selectProjects rtl-tests`  | As above.                                                                          |
| `test:coverage` | `jest --coverage`                  | Reporting only — see the open question on thresholds.                              |

## What This Does Not Cover

No API route handler tests, no Prisma-backed integration tests, no server-action tests, no
end-to-end. Those need a database lifecycle, request/response fixtures, and a mocking strategy
(`msw` or otherwise) that this project deliberately does not take on. If they are added later they
become a third `TestModule` — the architecture accommodates it, which is part of why it is worth
building correctly now.
