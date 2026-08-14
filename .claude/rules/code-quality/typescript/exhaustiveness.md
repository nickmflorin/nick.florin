---
paths:
  - '**/*.{ts,tsx}'
description: 'Exhaustive handling of union and enum types; no fallthrough, no bare default cases'
---

<!-- Parity: keep in sync with .github/instructions/code-quality/typescript/exhaustiveness.instructions.md -->

# Exhaustive Type Checking

## The Rule

Any conditional that branches on a **finite** type — a string- or number-literal union, a TypeScript
`enum`, an `enumeratedLiterals` member type, a discriminated union's tag, or a Prisma enum — must
handle every member of that type explicitly, in a form the compiler can verify. A branch structure
that merely happens to cover every case today is not acceptable; the compiler must be the thing that
guarantees it.

Concretely, the following are disallowed when branching on a finite type:

- An `if`/`else if` chain with no `else`, where falling off the end yields `undefined` implicitly.
- An `if`/`else if` chain whose final `else` is a catch-all that absorbs unrecognized members.
- A `switch` with a `default` clause that returns, renders, or throws a generic value.
- A lookup object typed as `Record<string, T>`, `Partial<Record<Union, T>>`, or left without an
  annotation.

A `default` clause in a `switch` over a finite type is allowed for exactly one purpose: to prove
exhaustiveness with a `never` assertion. It must never produce a real value.

## Why This Matters

The value of a finite type is that its members are known at compile time. That value is only
realized if adding or removing a member is a **compile error** at every site that branches on it.

When a chain of conditionals silently falls through, adding a new member to the union produces a
program that still compiles and still passes the linter, but now returns `undefined`, renders
nothing, or drops a record on the floor at some site nobody remembered to update. The defect
surfaces in production, far from the one-line type change that caused it. Exhaustive checking
converts that class of bug into a build failure listing exactly the sites that need attention.

This is why a `default` that returns a fallback is worse than no `default` at all: it is a
permanent, silent opt-out from that guarantee.

## Approach A: Extract to a Function with an Annotated Return Type

Move the conditional into its own function and annotate a return type that does **not** include
`undefined`. TypeScript then reports
`Function lacks ending return statement and return type does not include 'undefined'` for any path
that is not covered.

```typescript
type Status = 'active' | 'archived' | 'draft';

const getStatusLabel = (status: Status): string => {
  if (status === 'active') {
    return 'Active';
  } else if (status === 'archived') {
    return 'Archived';
  }
  return 'Draft';
};
```

This only works when the annotated return type excludes `undefined`. An annotation of
`string | undefined` reintroduces the fallthrough it was meant to prevent.

### Absence Is `| null`, Never `| undefined`

Many exhaustive functions genuinely have nothing to return for some inputs — a lookup that finds no
match, a variant that renders nothing. Model that absence as `| null`. `| undefined` is the one
addition that silently disables the check, because falling off the end of a function produces
exactly `undefined`, so an unhandled member becomes indistinguishable from a handled one that found
nothing.

This is not a stylistic preference between two null-ish values. It decides whether the compiler is
still doing the work:

```typescript
// Disallowed: `| undefined` readmits the fallthrough, so the `default` clause is now load-bearing
// — it is the only thing catching a new member of the union.
const lookup = (correlation: LegacyCorrelation): Date | undefined => {
  switch (correlation.entity) {
    case 'competency':
      return competencyBySlug.get(correlation.slug);
    case 'role':
      return roleByTitle.get(correlation.title);
    default:
      return assertNever(correlation);
  }
};

// Correct: `| null` cannot be produced by falling off the end, so the annotation itself proves
// exhaustiveness and the `default` clause comes out. Adding a member to `LegacyCorrelation` now
// fails to compile here with "Function lacks ending return statement".
const lookup = (correlation: LegacyCorrelation): Date | null => {
  switch (correlation.entity) {
    case 'competency':
      return competencyBySlug.get(correlation.slug) ?? null;
    case 'role':
      return roleByTitle.get(correlation.title) ?? null;
  }
};
```

`src/database/content/legacy-created-at.ts` is the working example. Note the `?? null` on each
branch: `Map.prototype.get` returns `V | undefined`, so a lookup has to be converted at the point it
is returned rather than left to widen the signature.

Prefer this to a `default: assertNever(...)` clause whenever the function returns a value. Both are
correct, but the annotation needs no maintenance, adds no branch that has to be read and understood,
and cannot be defeated later by someone giving the `default` a real value to return. Approach C's
`assertNever` remains the right tool where the branches carry logic rather than produce a value, or
where a genuinely out-of-band runtime value should throw.

Where a function must interoperate with an API that reads `undefined` specifically — Prisma treats
an undefined column as "not provided" and applies its default — keep `| null` on the exhaustive
function and convert at the boundary, so the conversion is one visible line rather than a weakened
signature.

### React: Annotate `JSX.Element`, Never `ReactNode`

`ReactNode` includes `undefined`, `null`, and `boolean`. A render function annotated
`(variant: Variant): ReactNode` compiles cleanly even when a variant is never handled, because
falling off the end produces `undefined`, which is a perfectly valid `ReactNode`. The annotation
does no work.

```tsx
// Disallowed: adding a variant to the union compiles, and that variant renders nothing.
const renderBadge = (variant: Variant): ReactNode => {
  if (variant === 'success') {
    return <SuccessBadge />;
  } else if (variant === 'warning') {
    return <WarningBadge />;
  }
};

// Correct: `JSX.Element` excludes `undefined`, so an unhandled variant fails to compile.
const renderBadge = (variant: Variant): JSX.Element => {
  if (variant === 'success') {
    return <SuccessBadge />;
  } else if (variant === 'warning') {
    return <WarningBadge />;
  }
  return <ErrorBadge />;
};
```

When a member genuinely renders nothing, annotate `JSX.Element | null` and `return null` from that
branch explicitly. The point is that "renders nothing" becomes a deliberate, written-down decision
rather than the consequence of a missing branch.

The same reasoning applies to any nullable return type: prefer the narrowest annotation the function
can honor, and add `| null` (never `| undefined`) only for the cases that really produce nothing.

## Approach B: A Lookup Record Typed Over the Union

When each member maps to a value rather than to a block of logic, prefer a lookup record keyed by
the union over any conditional at all. `Record<Union, T>` requires a key for every member, so a new
member is a compile error at the record and an unrecognized key is a compile error too.

Two forms are acceptable, and the choice between them is about the value types:

```typescript
type Brand = 'company' | 'course' | 'skill';

// Form 1: `as const satisfies` — checks exhaustiveness while preserving literal value types.
// Use this when the values themselves need to stay narrow (to derive a type from them, to index
// into them, or to keep a literal union of the values).
export const PageSizes = {
  company: 8,
  course: 16,
  skill: 16,
} as const satisfies Record<Brand, number>;

// Form 2: a type annotation — checks exhaustiveness and widens the values to the annotated type.
// Use this when the values are already at the right level of abstraction.
export const BrandIcons: Record<Brand, IconProp> = {
  company: icons.IconNames.BUILDING,
  course: icons.IconNames.BOOK,
  skill: icons.IconNames.STAR,
};
```

`src/actions/types/search.ts` (`PAGE_SIZES`, `SEARCH_FIELDS`) and
`src/components/types/typography.ts` are working examples of the `as const satisfies Record<...>`
form in this codebase.

The record form extends to components and to functions, which is usually the cleanest way to remove
a render-time conditional entirely:

```tsx
const BadgeComponents = {
  success: SuccessBadge,
  warning: WarningBadge,
  error: ErrorBadge,
} as const satisfies Record<Variant, ComponentType<BadgeProps>>;

const Badge = ({ variant, ...props }: BadgeProps & { readonly variant: Variant }): JSX.Element => {
  const Component = BadgeComponents[variant];
  return <Component {...props} />;
};
```

### Never Weaken the Record's Key Type

The exhaustiveness guarantee comes entirely from the key type. Each of these throws it away and is
disallowed:

```typescript
// Disallowed: `string` keys accept anything and require nothing.
const Labels: Record<string, string> = { active: 'Active' };

// Disallowed: `Partial` makes every key optional, so a missing member is legal.
const Labels: Partial<Record<Status, string>> = { active: 'Active' };

// Disallowed: no annotation at all, so the record's key type is inferred from its own contents
// and can never disagree with them.
const Labels = { active: 'Active' };
```

If a record genuinely applies to only some members of a union, that is not a reason to reach for
`Partial` — it is a signal that the record is keyed by a **subset type**, which must be expressed
with `Extract` or `Exclude` (see below) and then covered exhaustively.

## Approach C: `switch` with a `never` Guard

For branches that carry real logic rather than a value, use a `switch` whose `default` clause exists
solely to assert that the switched-over value has been narrowed to `never`. Because every `case`
narrows the value, the `default` is only reachable — to the type checker — if some member was left
unhandled, and assigning that residual member to `never` fails to compile.

Two equivalent forms are used; both are acceptable.

```typescript
// Form 1: the `assertNever` helper, which both proves exhaustiveness and throws at runtime if an
// out-of-band value reaches it (a value from an API response or the database, for example).
const applyTransition = (status: Status, record: Record): Record => {
  switch (status) {
    case 'active':
      return activate(record);
    case 'archived':
      return archive(record);
    case 'draft':
      return reset(record);
    default:
      return assertNever(status);
  }
};

// Form 2: an inline `never` guard, when the switch does not return and there is nothing to throw.
const emit = (status: Status): void => {
  switch (status) {
    case 'active':
      emitActive();
      break;
    case 'archived':
      emitArchived();
      break;
    case 'draft':
      emitDraft();
      break;
    default:
      const _exhaustive: never = status;
  }
};
```

`assertNever` is declared in `src/lib/typeguards.ts`:

```typescript
export const assertNever = (value: never): never => {
  throw new TypeError(`Unexpectedly encountered value '${String(value)}' in exhaustive switch!`);
};
```

Prefer `assertNever` (form 1) whenever the switch produces a value: its `never` return type
satisfies the function's return type on that path, so no fallback value has to be invented, and it
converts a genuinely unexpected runtime value into a loud error rather than silent `undefined`.

The inline guard (form 2) is named with a leading underscore so that
`@typescript-eslint/no-unused-vars`, which is configured with `varsIgnorePattern: '^_'`, does not
report it.

### What a `default` Must Never Do

```typescript
// Disallowed: the default absorbs every future member of `Status`.
switch (status) {
  case 'active':
    return activate(record);
  default:
    return record;
}

// Disallowed: throwing a generic error is still a runtime failure, not a compile-time one.
switch (status) {
  case 'active':
    return activate(record);
  default:
    throw new Error(`Unknown status: ${status}`);
}
```

The second form is the more tempting mistake. It looks defensive, but it defers to runtime exactly
the check the compiler was willing to perform for free. `assertNever` gives both: the compile-time
check _and_ the runtime throw.

## Slicing Unions with `Extract` and `Exclude`

Exhaustiveness is only tractable if functions are typed against the set of members they actually
handle. A finite union is meant to be sliced: when logic applies to a subset, narrow the parameter
type to that subset rather than accepting the full union and handling the remainder with a fallback.

```typescript
// Correct: only the brands that are rendered in an admin table can be passed, so the record below
// is exhaustive over exactly the set the code supports.
type TabledBrand = Extract<Brand, 'company' | 'course' | 'education' | 'experience' | 'skill'>;

export const PageSizes = {
  company: 8,
  course: 16,
  education: 8,
  experience: 8,
  skill: 16,
} as const satisfies Record<TabledBrand, number>;

// Correct: everything except the terminal states.
type MutableStatus = Exclude<Status, 'archived' | 'deleted'>;

const applyEdit = (status: MutableStatus, record: Record): Record => {
  /* ... */
};
```

Prefer `Extract` over writing the subset out as a bare literal union.
`Extract<Brand, 'company' | 'course'>` is checked against `Brand`, so removing or renaming
`'company'` upstream is a compile error at the subset; a hand-written `'company' | 'course'`
silently keeps compiling as a union of strings that no longer correspond to anything.
`src/actions/types/search.ts` uses `Extract` this way.

The payoff is that the caller, not the callee, is responsible for narrowing. A function that accepts
`MutableStatus` can never be reached with an archived record, so it needs no defensive branch, and
the narrowing happens once at the boundary where the type is actually discriminated.

## Discriminated Unions

The same rules apply when switching on a discriminant property, and the payoff is larger because
each `case` also narrows the object's shape:

```typescript
type Event =
  | { readonly kind: 'created'; readonly at: Date }
  | { readonly kind: 'renamed'; readonly from: string; readonly to: string }
  | { readonly kind: 'deleted'; readonly reason: string };

const describe = (event: Event): string => {
  switch (event.kind) {
    case 'created':
      return `Created at ${event.at.toISOString()}.`;
    case 'renamed':
      return `Renamed from ${event.from} to ${event.to}.`;
    case 'deleted':
      return `Deleted: ${event.reason}.`;
    default:
      return assertNever(event);
  }
};
```

When a new variant is added to `Event`, `assertNever(event)` fails to compile in every function that
switches on `kind`, which is precisely the list of places that need updating.

## Where This Does Not Apply

These rules govern **finite** types. A value typed `string`, `number`, or an open-ended branded
string has no enumerable set of members, so a `default` or a final `else` is the only way to write
it and is expected. If a value that ought to be finite is typed as `string`, the fix is to give it a
finite type, not to accept the fallthrough.

## Applying the Convention

These rules govern new code and deliberate restructures. Parts of the codebase predate them; do not
sweep the repository converting existing conditionals as a side effect of unrelated work. When a
conditional over a finite type is already being added, moved, or rewritten — or when a member is
being added to a union — bring the affected sites into conformance as part of that change.

## Further Reading

TypeScript's official documentation on
[narrowing and exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).
