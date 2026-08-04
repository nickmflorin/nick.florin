# TypeScript

Guides covering the TypeScript conventions used in this repository.

## Quick Navigation

| I want to...                            | Go to                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------- |
| Declare a type or interface             | [Types & Interfaces](./types-interfaces.md)                             |
| Mark type properties readonly           | [Types & Interfaces → Readonly](./types-interfaces.md)                  |
| Name a module-scope constant            | [Variable Naming](./variable-naming.md)                                 |
| Name a local variable                   | [Variable Naming → What It Does Not Cover](./variable-naming.md)        |
| Branch on a union or enum               | [Exhaustive Type Checking](./exhaustiveness.md)                         |
| Write a `switch` over a finite type     | [Exhaustive Type Checking → `never` Guard](./exhaustiveness.md)         |
| Restrict a function to part of a union  | [Exhaustive Type Checking → Slicing Unions](./exhaustiveness.md)        |
| Write a type guard                      | [Type Guards & Assertions](./type-guards.md)                            |
| Declare a finite union of string values | [Type Guards & Assertions](./type-guards.md)                            |
| Write an `asserts value is X` function  | [Type Guards & Assertions → Assertions](./type-guards.md)               |
| Index into an array or record safely    | [Indexed Access](./indexed-access.md)                                   |
| Resolve a `no-unnecessary-condition`    | [Indexed Access](./indexed-access.md)                                   |
| Know whether an `as` cast is allowed    | [Unsafe Type Coercion](./type-coercion.md)                              |
| Choose between `as` and `satisfies`     | [Unsafe Type Coercion → `as const` and `satisfies`](./type-coercion.md) |
| Type the result of `await res.json()`   | [Unsafe Type Coercion → HTTP Responses](./type-coercion.md)             |
| Validate an unknown payload with Zod    | [Unsafe Type Coercion → Zod at the Boundaries](./type-coercion.md)      |

## Document Overview

### [Types & Interfaces](./types-interfaces.md)

Conventions for declaring object shapes: the `readonly` modifier on every type and interface
property, what the convention does and does not govern, and when omitting the modifier is justified.

### [Variable Naming](./variable-naming.md)

Conventions for naming variables: PascalCase for module-scope constants rather than
`SCREAMING_SNAKE_CASE`, camelCase for locals and for functions bound to a constant, and why ESLint
does not catch a violation.

### [Exhaustive Type Checking](./exhaustiveness.md)

Handling every member of a finite type in a form the compiler verifies: why fallthrough and
value-producing `default` clauses are disallowed, the three approaches (an annotated return type, a
`Record` keyed by the union, a `switch` with an `assertNever` guard), the `ReactNode` versus
`JSX.Element` trap, and slicing unions with `Extract` and `Exclude`.

### [Type Guards & Assertions](./type-guards.md)

Narrowing values whose type is not yet known: type-predicate signatures, deriving a finite union
from a `readonly` array so the array is the single source of truth, why the cast in a guard belongs
on the value rather than on the array it is checked against, branded types for format validation,
and `asserts value is X` functions.

### [Indexed Access](./indexed-access.md)

Indexing arrays and records while `noUncheckedIndexedAccess` is off: when an index access is
justified, preferring `at` and `find`, and resolving the `no-unnecessary-condition` violation by
widening through the reference type rather than deleting the check.

### [Unsafe Type Coercion](./type-coercion.md)

Why unvalidated `as` casts are never permitted: `unknown` in place of `any`, the type-level
positions where an assertion genuinely is unavoidable (generic and conditional return types,
inference boundaries), `as const` and `satisfies` as the non-lying alternatives, validating with Zod
and deriving the type with `z.infer`, and the `Response.json()` boundary.

## AI Instructions

The prescriptive counterparts of these conventions for AI code generation live in
`.claude/rules/code-quality/typescript/` (Claude Code) and
`.github/instructions/code-quality/typescript/` (GitHub Copilot), which are maintained as parity
copies of each other.
