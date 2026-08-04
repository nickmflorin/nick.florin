---
applyTo: '**/*.{ts,tsx}'
description:
  'Indexing arrays and records safely without noUncheckedIndexedAccess, and the
  no-unnecessary-condition interaction'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/typescript/indexed-access.md -->

# Indexed Access

## The Configuration

`tsconfig.json` enables `strict`, which does **not** include `noUncheckedIndexedAccess`. That flag,
when on, types every index access into an array or a string-index signature as `T | undefined`,
forcing the absence case to be handled:

```typescript
const rows: Row[] = [];

// With `noUncheckedIndexedAccess`:  Row | undefined
// As currently configured:          Row
const first = rows[0];
```

Enabling it is the correct long-term fix and is worth doing, but it is a repository-wide change with
a large migration cost, so it is off today. Until it is on, **the compiler will not warn about a
single out-of-bounds access anywhere in this codebase**, and the rules below are what stand in for
it. They are manual and must be applied while writing the code.

## The Rule

Every index access is an implicit, unchecked assertion that the index is in bounds. Write one only
when the code has already established that it is.

An access is justified when non-emptiness is guaranteed by construction and is visible in the
immediate vicinity:

```typescript
// Justified: the index is bounded by the length.
for (let i = 0; i < rows.length; i++) {
  process(rows[i]);
}

// Justified: a literal with known contents.
const Defaults = ['sm', 'md', 'lg'] as const;
const smallest = Defaults[0];

// Justified: the length was just checked.
if (rows.length > 0) {
  return rows[0].id;
}
```

An access is **not** justified when the collection comes from a query, a parse, a `filter`, a
`split`, a regular expression, or any other source whose size is not established at the access site.
For those, produce a value that is explicitly `T | undefined` and handle the absence.

## Preferred Forms

### Arrays: `at()`

`Array.prototype.at` returns `T | undefined` regardless of the compiler flags, which is exactly the
type the access deserves. Prefer it for any access whose index is not already bounded:

```typescript
const first = rows.at(0);
if (first === undefined) {
  return null;
}
return first.id;
```

### Records and Maps

`Map.prototype.get` already returns `V | undefined` and needs nothing extra. A plain object with a
string index signature does not, so annotate the receiving binding (see below).

### Encode Non-Emptiness in the Type

When a function requires a non-empty collection, say so in the signature rather than indexing on
faith. A tuple-rest type is the simplest form and needs no helper:

```typescript
const summarize = (rows: readonly [Row, ...Row[]]): string => rows[0].label;
```

The caller is then responsible for narrowing, which is where the check belongs. `assertDefined` and
`ensuresDefinedValue` from `src/lib/typeguards.ts` cover the same need for a single value.

### Never a Non-Null Assertion

`rows[0]!` is disallowed and is rejected by `@typescript-eslint/no-non-null-assertion`. It is
strictly worse than the bare `rows[0]`, because it advertises that the author considered the absence
case and dismissed it.

## The `no-unnecessary-condition` Interaction

`@typescript-eslint/no-unnecessary-condition` is configured as `error`. Because index access is not
widened with `undefined`, the rule sees `rows[0]` as having the element type exactly — so a truthy
check on it is reported as unnecessary whenever the element type has no falsy values:

```typescript
const rows: Row[] = getRows();

// Error: "Unnecessary conditional, value is always truthy." `rows[0]` is typed `Row`, an object
// type, and every object is truthy.
if (rows[0]) {
  return rows[0].id;
}
```

Note that the rule does **not** fire for `string[]` or `number[]`, because `''` and `0` are falsy
and the condition is therefore meaningful to the checker. This is what makes the situation
dangerous: the guard the author wrote is equally necessary in both cases, but the linter only
objects to one of them, and the natural way to satisfy it is to delete the guard.

### Deleting the Check Is the Wrong Fix

Removing the condition is disallowed. So is disabling the rule; although
`@typescript-eslint/no-unnecessary-condition` appears in the catalog of disable-able rules, this is
not a false positive being reported against correct code — it is a real gap in the type, and the
type is what must be fixed.

### The Fix: Widen Through the Reference Type

Give the value a type that includes `undefined`, derived from the collection being indexed. The
condition then carries real information and the rule is satisfied on the merits:

```typescript
const first: (typeof rows)[number] | undefined = rows[0];
if (first) {
  return first.id;
}
```

For a record, index the reference type by its key type the same way:

```typescript
const options: (typeof ConfigByKey)[string] | undefined = ConfigByKey[key];
```

When there is no binding to annotate, the same widening can be applied inline as an assertion on the
collection. Prefer the annotated binding; use this form only where introducing a variable is not
practical:

```typescript
if ((rows as ((typeof rows)[number] | undefined)[])[0]) {
  /* ... */
}
```

### Always Derive, Never Restate

The element type must be obtained from the collection with `(typeof collection)[number]`, never
written out by name:

```typescript
// Correct: the annotation follows `rows` automatically.
const first: (typeof rows)[number] | undefined = rows[0];

// Disallowed: `Row` is a second place that has to be kept in step with `rows`, and it is not
// available at all when `rows` is generic, mapped, or the result of an inline expression.
const first: Row | undefined = rows[0];
```

Restating the type is how the annotation drifts: when the collection's element type changes, the
derived form updates with it and the restated form either breaks in a confusing place or, worse,
stays assignable and quietly describes the wrong thing. This is the same principle as deriving a
union from its array rather than declaring both — the reference is the source of truth, and every
type expressed about it is computed from it.

## Common Unchecked Sources

These return values are routinely indexed without a check and are the places to look first:

| Expression             | Actual risk                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| `value.split(sep)[1]`  | Yields `undefined` whenever the separator is absent.                       |
| `regex.exec(value)[1]` | `exec` returns `null`; capture groups are `string \| undefined`.           |
| `array.filter(fn)[0]`  | Empty whenever nothing matches — use `find`, which returns `\| undefined`. |
| `Object.keys(obj)[0]`  | Empty for an empty object.                                                 |
| `(await query())[0]`   | Empty whenever the query matches no rows.                                  |
| `JSON.parse(raw)[0]`   | Unvalidated shape entirely — narrow with a guard or a schema first.        |

`array.find(fn)` is the direct replacement for `array.filter(fn)[0]`: it returns `T | undefined`
natively, needs no widening, and satisfies `no-unnecessary-condition` without any annotation.

## Applying the Convention

These rules govern new code and deliberate restructures. Parts of the codebase index without a check
— `src/components/types/sizes.ts` reads a regular expression capture group directly, for example —
and must not be swept as a side effect of unrelated work. When an index access is already being
added, moved, or rewritten, bring it into conformance as part of that change.

## Further Reading

TypeScript's official documentation on
[`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess) and
on [indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html).
