# Variable Naming

Conventions for naming variables and constants in this repository.

## Module-Scope Constants

A `const` declared at module scope — at the top level of a file, outside every function and block —
that is bound to a value is named in PascalCase, whether or not it is exported.
`SCREAMING_SNAKE_CASE` is not used.

```ts
const DefaultPageSize = 25;

export const SupportedLocales = ['en-US', 'en-GB'];

const MimeTypes: Record<string, string | undefined> = {
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
```

The convention covers every kind of value a constant can hold: primitives, arrays, object literals,
regular expressions, `Map`s and `Set`s, lookup tables, and configuration objects.

The reasoning is consistency rather than information. `SCREAMING_SNAKE_CASE` conventionally signals
"compile-time constant", a distinction that does not exist in TypeScript, where `const` already says
everything the casing would. Since the codebase names every other module-scope declaration —
components, types, interfaces, enums — in PascalCase, constants reading the same way removes a
casing decision from the act of declaring one.

## What the Convention Does Not Cover

**Functions bound to a constant** are functions, not constants, and keep camelCase — or PascalCase
when the function is a React component, for that reason rather than this one. A helper does not
become `ResolveAssetPath` merely because it is a module-scope `const`.

```ts
const resolveAssetPath = (reference: string): string => path.join(PublicDir, reference);
```

**Variables inside a function or block** stay camelCase regardless of how they are declared.

**Type-level declarations** are unaffected: types, interfaces, and enums are PascalCase already, and
enum members keep whatever casing their domain requires — the SCREAMING_SNAKE identifiers that map
onto Prisma enum values, for example.

## Tooling

ESLint does not enforce this. Its `camelcase` rule ignores PascalCase and SCREAMING_SNAKE_CASE
identifiers alike, so both forms pass `pnpm lint`. The convention is maintained while writing code,
not caught by a checker afterwards.

## Applying the Convention

The convention governs new declarations and deliberate restructures. Parts of the codebase predate
it; existing constants are not mass-renamed as a side effect of unrelated work, but a declaration
that is already being added, moved, or rewritten is brought into conformance as part of that change.
Because renaming an exported constant breaks every module that imports it, a rename updates every
reference in the same change.
