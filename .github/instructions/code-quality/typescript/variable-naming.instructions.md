---
applyTo: '**/*.{ts,tsx}'
description: 'Conventions for naming variables and module-scope constants'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/typescript/variable-naming.md -->

# Variable Naming

## Module-Scope Constants: PascalCase

A `const` declared at module scope — at the top level of a file, outside every function and block —
that is bound to a value is named in **PascalCase**. This applies whether or not the constant is
exported.

`SCREAMING_SNAKE_CASE` (also called TITLE_CASE or CONSTANT_CASE) is not used for these declarations
and must never be generated.

```typescript
// Correct.
const DefaultPageSize = 25;
export const SupportedLocales = ['en-US', 'en-GB'];

// Disallowed.
const DEFAULT_PAGE_SIZE = 25;
export const SUPPORTED_LOCALES = ['en-US', 'en-GB'];
```

## What the Rule Governs

The rule governs module-scope constants that hold a **value**, regardless of what kind of value it
is: primitives, arrays, object literals, regular expressions, `Map`s and `Set`s, lookup tables, and
configuration objects are all named in PascalCase.

```typescript
const ChromePrintFlags = ['--headless=new', '--disable-gpu'];

const MimeTypes: Record<string, string | undefined> = {
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const RootAbsoluteStylesheetUrl = /url\((["']?)(\/[^"')]+)\1\)/g;
```

## What the Rule Does Not Govern

### Functions Bound to a Constant

A module-scope `const` bound to a function is a function, not a constant, and follows the naming
convention for functions instead: **camelCase**, or **PascalCase** when the function is a React
component. Do not rename a function to PascalCase merely because it is declared with `const` at
module scope.

```typescript
// Correct: a function, so camelCase, even though it is a module-scope const.
const resolveAssetPath = (reference: string): string => path.join(PublicDir, reference);

// Correct: a React component, so PascalCase for that reason, not this one.
const TabButton = ({ label }: TabButtonProps) => <button>{label}</button>;
```

### Variables Inside a Function or Block

Locals, parameters, and any other binding declared inside a function or block stay **camelCase**,
regardless of whether they are declared with `const`.

```typescript
const emitStylesheet = async (): Promise<void> => {
  const compiled = await sass.compileAsync(DocumentStylesEntry);
  const references = new Set<string>();
};
```

### Types, Interfaces, and Enums

Type-level declarations are unaffected by this rule. Types, interfaces, and enums are PascalCase
already; enum **members** keep whatever casing their own domain requires (for example the
SCREAMING_SNAKE identifiers that map onto Prisma enum values).

## Relationship to ESLint

ESLint does not enforce this convention: the `camelcase` rule ignores both PascalCase and
SCREAMING_SNAKE_CASE identifiers, so both forms pass the linter. The convention is therefore
maintained by the developer and by generated code, not by a checker, and must be applied when
writing new declarations rather than deferred to `pnpm lint`.

## Applying the Convention

These rules govern new declarations and deliberate restructures. Parts of the codebase predate the
convention; do not mass-rename existing constants as a side effect of unrelated work. When a
declaration is already being added, moved, or rewritten, bring its name into conformance as part of
that change.

Renaming an exported constant is a breaking change to every module that imports it, so a rename must
update every reference in the same change.
