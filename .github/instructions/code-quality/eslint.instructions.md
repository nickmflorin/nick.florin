---
applyTo: '**/*.{ts,tsx,js,jsx,mjs,cjs}'
description: 'Guidelines for working with ESLint and disabling rules'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/eslint.md -->

# Using ESLint

## Source of Truth

ESLint, with Prettier running through it, is the definitive style guide for the codebase, and its
configuration is authoritative. All generated code must pass `pnpm lint:errors`. The configuration
lives in `tooling/eslint-config-web/`; consult the relevant `configs/*.mjs` file before assuming how
a rule behaves, and treat the configuration as the source of truth whenever a rule's behavior is in
question.

## Linting and Formatting

ESLint and Prettier together enforce code quality and formatting. Which tool formats a given file is
determined by its extension, and for ESLint-formatted files Prettier runs via
`eslint-plugin-prettier`. Do not hand-format around the tools or fight their output. If a rule or a
formatting decision seems wrong, change the shared configuration rather than working around it
locally.

## Running After Edits

After editing code, the only formatting that may be run automatically is Prettier (for example a
`prettier`/`prettier:format` script or `pnpm exec prettier --write` on the changed files). Do not
automatically run ESLint after edits — not the linter (`eslint`, `lint`, `lint:errors`) and not its
autofix (`eslint --fix`, the `eslint:format`/`format` scripts, or any other "eslint format" step).
Run ESLint only when explicitly asked to do so. This keeps the inner loop fast and leaves linting to
the developer or CI.

## Warnings and Grandfathered Rules

A rule set to `warn` is not a rule that may be ignored. `pnpm lint:errors` suppresses warnings so
that CI is not blocked by them, which means a warning is invisible in the one place most people
look. Treating it as noise is therefore how it survives.

Some rules sit at `warn` specifically because they were enabled against code that already violated
them. That is the **grandfathered** case, and it is marked in the configuration by the shared
`GrandfatheredSeverity` constant rather than by a bare `'warn'`, so that the intent is legible at
the rule and a reader can tell a deliberate migration from an ordinary warning:

```javascript
/* Grandfathered because components across the codebase still render with '&&'; promote to 'error'
   once every occurrence uses a ternary. */
'react/jsx-no-leaked-render': [GrandfatheredSeverity, { validStrategies: ['ternary'] }],
```

The contract for a grandfathered rule:

- **New and modified code satisfies it as though it were an error.** The lowered severity exists to
  keep an existing backlog from failing CI, never to make the rule optional for code being written
  now.
- **A violation reported on code already being touched is fixed as part of that change**, exactly as
  the other conventions in this directory are applied.
- **Violations elsewhere are not swept** as a side effect of unrelated work.
- **The rule carries a comment** recording what remains to be migrated and what promotes it.
- **The rule is promoted to `error`** once the last violation is resolved, and stops using the
  constant at that point.

A grandfathered warning is never resolved by disabling the rule, by setting it to `off`, or by
writing the violating form and leaving it. Those defeat the only purpose the severity has.

### Currently Grandfathered

| Rule                         | What remains                                                       | Promotes when                   |
| ---------------------------- | ------------------------------------------------------------------ | ------------------------------- |
| `react/jsx-no-leaked-render` | Components rendering conditionally with `&&` rather than a ternary | Every occurrence uses a ternary |

## Disabling Rules

Disabling an ESLint rule is a true last resort, used only when there is literally no other option.
Never disable a rule simply to silence it. A disable is justified only when one of these holds:

- The rule is **falsely reporting** the violation (a genuine false positive), or
- There is **no other way to write the code** that would avoid violating the rule, due to a
  technical constraint or a business-logic constraint.

If the violation can be resolved by writing the code differently, you must do that instead of
disabling the rule. A disable directive is a standing claim that neither escape hatch was available;
a reviewer should be able to read it and agree.

### Rule Categories

Every rule falls into one of three categories that decides whether and where it may be disabled.
**By default, every rule is `Never`.** A rule may be disabled only if it appears in the catalog
below; if a rule is not listed there, it must never be disabled, and any violation must be resolved
by changing the code.

- **Never** (the default): never disabled, in test or non-test files, under any circumstance.
- **Limited (test only)**: never disabled in non-test files; disabled in test files only when
  absolutely necessary.
- **Limited**: disabled in either test or non-test files, only when absolutely necessary.

The category only controls _where_ the last-resort bar above can be met; it never lowers that bar.
"Absolutely necessary" still means a genuine false positive or no other way to write the code.

Auto-fixable formatting rules (the stylistic rules Prettier and `--fix` resolve automatically) are
`Never`: fix the formatting, never disable it. The single exception is `import/order`, which may be
disabled when an import must keep a specific order the rule would otherwise rewrite.

`@typescript-eslint/ban-tslint-comment` deserves explicit mention: it must **never** be disabled
under any circumstances, in any file, test or non-test. There is no scenario in which a TSLint
directive belongs in this codebase.

### Catalog of Disable-able Rules

These are the only rules that may be disabled. Everything else is `Never`.

**Limited** (test or non-test, only when absolutely necessary):

- `camelcase`
- `max-lines`
- `no-await-in-loop`
- `no-console`
- `import/order`
- `@typescript-eslint/await-thenable`
- `@typescript-eslint/no-empty-function`
- `@typescript-eslint/no-empty-object-type`
- `@typescript-eslint/no-require-imports`
- `@typescript-eslint/no-unnecessary-condition`
- `@typescript-eslint/no-unused-vars`
- `react-hooks/refs`

**Limited (test only)** (never in non-test files; in test files only when absolutely necessary):

- `@typescript-eslint/no-unsafe-member-access`
- `@typescript-eslint/require-await`

### `no-console`: a more lenient bar

`no-console` is in the `Limited` category, but it may be disabled more liberally than the strict "no
other way" bar that governs the other `Limited` rules. The structured logger is preferred for all
output, but it cannot always be used: early bootstrap and environment modules that the logger itself
depends on, build scripts, and standalone CLI tooling are the common cases. In those contexts
`no-console` may be disabled without meeting the strict bar. It is already turned off in test files
via `jest.mjs`, so a disable is only ever needed in non-test code.

### `@typescript-eslint/no-unnecessary-condition`: fix the type, never the check

`no-unnecessary-condition` is in the `Limited` category, but a report from it is almost never a
false positive. The rule is type-driven: it fires precisely because the declared type says the check
cannot matter. When the check does matter at runtime, the defect is in the **type**, and the type is
what gets fixed. Disabling the rule freezes the wrong type in place and blinds that site to every
future violation, and deleting the condition removes a guard the runtime still needs. Both are
disallowed.

There is essentially always a type-level way out, and it must be taken before a disable is
considered:

- **Index access.** Because `noUncheckedIndexedAccess` is off, `rows[0]` is typed as the element
  type rather than `element | undefined`, so a guard on it is reported as unnecessary whenever the
  element type has no falsy values. Widen the value through the reference type:

  ```typescript
  const first: (typeof rows)[number] | undefined = rows[0];
  if (first) {
    return first.id;
  }
  ```

- **A value the type claims is always defined** that in fact arrives from an API response,
  `JSON.parse`, or a database query. Narrow it with a type guard or a schema at the boundary rather
  than checking a type nothing ever verified.
- **An optional chain or `??` applied to a non-nullable value.** Either the operator is genuinely
  redundant and comes out, or the value really can be absent and the type has to say so.
- **A comparison against a value the union does not contain.** Either the union is missing a member
  or the comparison is dead code; both are resolved by editing the code, not by a directive.

A disable is warranted only where the type cannot be corrected from within this repository — a
third-party declaration that overstates its guarantees, or a generic position where the checker
resolves a type parameter more narrowly than a caller can. The explanation must name which of those
applies and why the type could not be fixed.

The index-access case is covered in full by the indexed-access rule in the `typescript/`
subdirectory of this same `code-quality/` directory (`indexed-access.md` for Claude Code,
`indexed-access.instructions.md` for Copilot).

### `react-hooks/refs`: only for cross-module false positives

`react-hooks/refs` is in the `Limited` category, but the only thing that justifies disabling it is a
genuine false positive, never a ref that is in fact read while rendering. The rule cannot see into
another module, so it reports a violation whenever a ref, or a closure over one, is handed to a
function it cannot analyze. That covers passing a ref to a third-party middleware that stores it and
dereferences it later (`@floating-ui`'s `arrow`), and passing a ref-capturing callback to a local
helper that only gates the callback on some condition and never invokes it during render.

A disable is warranted only once it has been established that the ref is not dereferenced until an
event handler, effect, or layout effect runs, and the explanation must say where it is dereferenced.
A ref that really is read during render must be fixed instead, by moving the read into an effect or
by holding the value in state.

### Exception: `@typescript-eslint/no-explicit-any`

`no-explicit-any` is `Never`: use `unknown` with a type guard instead of `any`. The one legitimate
use of `any` is type inference over function argument or return types, where no more specific type
can express the constraint, such as matching any function signature in a conditional type to infer
its return type:

```typescript
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
```

The rule is configured with `ignoreRestArgs: true`, so the `...args: any[]` rest-parameter form
above is already allowed and needs no disable directive. A disable is warranted only for an
inference use of `any` that the `ignoreRestArgs` exemption does not already cover; outside of
inference, treat `no-explicit-any` as `Never`.

### Writing a Disable Directive

When a disable is genuinely warranted, it must be tightly scoped and explained:

- Target a single line with `eslint-disable-next-line <rule>` placed on its own line above the code,
  written in the `/* ... */` block form used across the codebase (avoid the trailing
  `eslint-disable-line` form). To exempt a block, open with `eslint-disable <rule>` and add a
  matching `eslint-enable <rule>` shortly after. Never leave a block-level disable open across
  unrelated code.
- Always disable a specific rule by name; never disable all rules. A bare `eslint-disable` is itself
  an error under `unicorn/no-abusive-eslint-disable`.
- Always include an explanation after a `--` separator, for example:

  ```typescript
  /* eslint-disable-next-line no-console -- The logger is not in context for seeding. */
  ```

- The exceptions are the `camelcase` rule (used for external snake_case API payloads) and the
  `max-lines` rule, which may be disabled without an explanation.

A disable directive that is no longer needed is itself an error under
`reportUnusedDisableDirectives`. Once the underlying code stops violating the rule, remove the
directive.
