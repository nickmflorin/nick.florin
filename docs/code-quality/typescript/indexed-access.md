# Indexed Access

Conventions for indexing into arrays and records, and for the ESLint interaction that the current
compiler configuration creates.

## The Configuration

`tsconfig.json` enables `strict`, which does not include `noUncheckedIndexedAccess`:

```typescript
const rows: Row[] = [];

// With `noUncheckedIndexedAccess`:  Row | undefined
// As currently configured:          Row
const first = rows[0];
```

With the flag on, every index access into an array or a string-index signature types as
`T | undefined`, forcing the absence case to be handled. With it off — as it is today — `rows[0]`
types as `Row` even when `rows` is empty, and the compiler will not warn about a single
out-of-bounds access anywhere in the codebase.

Enabling the flag is the correct long-term fix, but it is a repository-wide change with a real
migration cost. Until then, the conventions below stand in for it, and they are manual.

## The Convention

Every index access is an implicit, unchecked assertion that the index is in bounds; it is written
only where the code has already established that:

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

An access into the result of a query, a `parse`, a `filter`, a `split`, or a regular expression is
not justified — those produce a value whose absence has to be represented.

`Array.prototype.at` is the cleanest way to do that, since it returns `T | undefined` regardless of
the compiler flags:

```typescript
const first = rows.at(0);
if (first === undefined) {
  return null;
}
return first.id;
```

`Map.prototype.get` already does the same, and `array.find(fn)` is the direct replacement for
`array.filter(fn)[0]`. Where a function genuinely requires a non-empty collection, saying so in the
signature moves the check to the caller, where it belongs:

```typescript
const summarize = (rows: readonly [Row, ...Row[]]): string => rows[0].label;
```

A non-null assertion is disallowed and is rejected by `@typescript-eslint/no-non-null-assertion`:

```typescript
// Disallowed: strictly worse than the bare access, because it advertises that the author
// considered the absence case and dismissed it.
return rows[0]!.id;
```

## The `no-unnecessary-condition` Interaction

`@typescript-eslint/no-unnecessary-condition` runs as an error. Because index access is not widened
with `undefined`, the rule sees `rows[0]` as having the element type exactly, so a truthy check on
it is reported as unnecessary whenever that element type has no falsy values:

```typescript
const rows: Row[] = getRows();

/* Error: "Unnecessary conditional, value is always truthy." `rows[0]` is typed `Row`, an object
   type, and every object is truthy. */
if (rows[0]) {
  return rows[0].id;
}
```

Notably, the rule does not fire for `string[]` or `number[]`, because `''` and `0` are falsy and the
condition therefore reads as meaningful. That asymmetry is what makes this worth writing down: the
guard is equally necessary in both cases, but the linter only objects to one of them, and the
obvious way to satisfy it is to delete the guard.

Deleting the check is the wrong fix, and so is disabling the rule. This is not a false positive
reported against correct code — it is a real gap in the type, and the type is what gets fixed.

### Widen Through the Reference Type

Give the value a type that includes `undefined`, derived from the collection being indexed. The
condition then carries real information and the rule is satisfied on the merits:

```typescript
const first: (typeof rows)[number] | undefined = rows[0];
if (first) {
  return first.id;
}

// A record is indexed by its key type the same way.
const options: (typeof ConfigByKey)[string] | undefined = ConfigByKey[key];
```

The element type is always **derived** from the collection, never restated by name:

```typescript
// Correct: the annotation follows `rows` automatically.
const first: (typeof rows)[number] | undefined = rows[0];

// Disallowed: `Row` is a second place that has to be kept in step with `rows`, and it is not
// available at all when `rows` is generic, mapped, or an inline expression.
const first: Row | undefined = rows[0];
```

When the collection's element type changes, the derived form follows it while the restated form
either breaks somewhere confusing or, worse, stays assignable and quietly describes the wrong thing.
This is the same principle behind deriving a union from its array rather than declaring both: the
reference is the source of truth, and every type expressed about it is computed from it.

## Where to Look

The routinely unchecked sources are the ones whose emptiness the type does not express:

```typescript
value.split(sep)[1]; // `undefined` whenever the separator is absent
regex.exec(value)[1]; // `exec` returns `null`; groups are `string | undefined`
array.filter(fn)[0]; // empty whenever nothing matches — use `find` instead
Object.keys(obj)[0]; // empty for an empty object
(await query())[0]; // empty whenever the query matches no rows
JSON.parse(raw)[0]; // unvalidated shape entirely — narrow with a guard or a schema first
```

## Reference

TypeScript's documentation on
[`noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess) and
[indexed access types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html).

The prescriptive counterpart of these conventions lives in
`.claude/rules/code-quality/typescript/indexed-access.md` and
`.github/instructions/code-quality/typescript/indexed-access.instructions.md`.
