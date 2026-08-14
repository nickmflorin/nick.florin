# Exhaustive Type Checking

Conventions for branching on finite types — string-literal unions, enums, `enumeratedLiterals`
members, discriminated unions, and Prisma enums — so that the compiler, rather than a reviewer,
guarantees every case is handled.

## The Idea

The whole point of a finite type is that its members are known at compile time. That only pays off
if adding or removing a member breaks the build at every site that branches on it.

Consider a helper that looks complete the day it is written:

```typescript
type Status = 'active' | 'archived';

const getStatusLabel = (status: Status) => {
  if (status === 'active') {
    return 'Active';
  } else if (status === 'archived') {
    return 'Archived';
  }
};
```

Adding a third member is a one-line change, and nothing objects:

```typescript
// The union gains a member...
type Status = 'active' | 'archived' | 'draft';

// ...and `getStatusLabel('draft')` now returns `undefined`. It still compiles. It still lints. The
// inferred return type quietly widened to `string | undefined`, and a blank label ships.
```

Exhaustive checking converts that class of bug into a compile error listing exactly the files that
need attention. For the same reason, a `default` clause that returns a fallback value is worse than
no `default` at all — it is a permanent, silent opt-out:

```typescript
// Disallowed: every member added to `Status` from now on lands here, silently.
switch (status) {
  case 'active':
    return activate(record);
  default:
    return record;
}
```

A `default` in a `switch` over a finite type exists for one purpose only: proving exhaustiveness
with a `never` assertion.

## Three Approaches

### Annotate a Return Type That Excludes `undefined`

Extracting the conditional into its own function lets the return annotation do the work. TypeScript
reports `Function lacks ending return statement and return type does not include 'undefined'` for
any path left uncovered:

```typescript
// Correct: the `string` annotation means a missing branch is a compile error.
const getStatusLabel = (status: Status): string => {
  if (status === 'active') {
    return 'Active';
  } else if (status === 'archived') {
    return 'Archived';
  }
  return 'Draft';
};
```

The React case deserves specific attention. `ReactNode` includes `undefined`, so a render helper
annotated with it compiles happily with a variant left unhandled — the annotation does nothing:

```tsx
// Disallowed: `ReactNode` includes `undefined`, so the missing `error` branch is legal and that
// variant simply renders nothing.
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

Where a member genuinely renders nothing, annotate `JSX.Element | null` and `return null` from that
branch explicitly, so "renders nothing" is a written-down decision rather than a missing branch.

The same choice appears whenever a function legitimately has nothing to return — a lookup that finds
no match, most commonly. Model that absence as `| null`, never `| undefined`. The two are not
interchangeable here: falling off the end of a function produces exactly `undefined`, so adding it
to the annotation makes an unhandled member indistinguishable from a handled one that found nothing,
and the check silently stops working.

```typescript
// Disallowed: `| undefined` readmits the fallthrough. The `default` clause is now the only thing
// catching a new member of the union.
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

// Correct: `| null` cannot arise from falling off the end, so the annotation proves exhaustiveness
// on its own and the `default` clause is unnecessary.
const lookup = (correlation: LegacyCorrelation): Date | null => {
  switch (correlation.entity) {
    case 'competency':
      return competencyBySlug.get(correlation.slug) ?? null;
    case 'role':
      return roleByTitle.get(correlation.title) ?? null;
  }
};
```

`src/database/content/legacy-created-at.ts` is the working example, including the `?? null` each
branch needs because `Map.prototype.get` returns `V | undefined`. Both forms are correct, but the
annotation needs no maintenance and cannot be defeated later by someone giving the `default` a real
value to return. When an API downstream wants `undefined` specifically — Prisma reads an undefined
column as "not provided" — convert at the boundary rather than widening the signature.

### A Lookup Record Keyed by the Union

When each member maps to a value rather than to logic, a record typed `Record<Union, T>` removes the
conditional entirely and requires a key for every member. Both forms are used; the choice depends on
whether anything downstream needs the narrow values:

```typescript
// `as const satisfies` — checks exhaustiveness and preserves the literal value types.
export const PageSizes = {
  company: 8,
  course: 16,
  skill: 16,
} as const satisfies Record<Brand, number>;

// A type annotation — checks exhaustiveness and widens the values to the annotated type.
export const BrandIcons: Record<Brand, IconProp> = {
  company: icons.IconNames.BUILDING,
  course: icons.IconNames.BOOK,
  skill: icons.IconNames.STAR,
};
```

`PAGE_SIZES` in `src/actions/types/search.ts` and the typography maps in
`src/components/types/typography.ts` are working examples. The pattern extends to components, which
is usually the cleanest way to delete a render-time conditional outright:

```tsx
const BadgeComponents = {
  success: SuccessBadge,
  warning: WarningBadge,
  error: ErrorBadge,
} as const satisfies Record<Variant, ComponentType<BadgeProps>>;
```

The guarantee lives entirely in the key type, so each of these gives it away:

```typescript
// Disallowed: `string` keys accept anything and require nothing.
const Labels: Record<string, string> = { active: 'Active' };

// Disallowed: `Partial` makes every key optional, so a missing member is legal.
const Labels: Partial<Record<Status, string>> = { active: 'Active' };

// Disallowed: with no annotation, the key type is inferred from the contents and can never
// disagree with them.
const Labels = { active: 'Active' };
```

A record that genuinely covers only part of a union is a record keyed by a subset type, expressed
with `Extract` rather than with `Partial`.

### `switch` with a `never` Guard

For branches carrying real logic, a `switch` whose `default` asserts the value has narrowed to
`never` is the standard form. Because each `case` narrows, the `default` is only reachable to the
type checker when a member was missed, and the residual member fails to assign to `never`:

```typescript
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
```

`assertNever` in [src/lib/typeguards.ts](../../../src/lib/typeguards.ts) is the helper for this. Its
`never` return type satisfies the enclosing function's return type, so no placeholder value has to
be invented, and it throws at runtime if a value from outside the declared type ever arrives from an
API response or the database. Where a switch returns nothing, an inline guard serves the same
purpose — the leading underscore keeps `no-unused-vars` quiet:

```typescript
default:
  const _exhaustive: never = status;
```

Throwing a plain `Error` from `default` is the tempting near-miss:

```typescript
// Disallowed: this defers to runtime exactly the check the compiler was willing to do for free.
default:
  throw new Error(`Unknown status: ${status}`);
```

`assertNever` gives both the compile-time check and the runtime throw.

## Slicing Unions

Exhaustiveness is only workable if functions are typed against the members they actually handle.
When logic applies to a subset, narrow the parameter rather than accepting the full union and
absorbing the remainder in a fallback:

```typescript
// Correct: only the brands rendered in an admin table can be passed, so a record keyed by
// `TabledBrand` is exhaustive over exactly the set the code supports.
type TabledBrand = Extract<Brand, 'company' | 'course' | 'skill'>;

// Correct: everything except the terminal states, so `applyEdit` needs no defensive branch.
type MutableStatus = Exclude<Status, 'archived' | 'deleted'>;

const applyEdit = (status: MutableStatus, record: Record): Record => {
  /* ... */
};
```

`Extract<Brand, 'company' | 'course'>` is checked against `Brand`, so renaming a member upstream is
a compile error at the subset — a hand-written `'company' | 'course'` would keep compiling as a
union of strings that no longer means anything. `src/actions/types/search.ts` uses `Extract` this
way.

The payoff is that narrowing happens once, at the boundary where the type is genuinely
discriminated, and the callee needs no defensive branch at all.

## Where It Does Not Apply

These conventions govern finite types. A `string`, a `number`, or an open-ended branded string has
no enumerable set of members, so a final `else` or a `default` is the only way to write it. When a
value that ought to be finite is typed as `string`, the fix is to give it a finite type rather than
to accept the fallthrough.

## Reference

TypeScript's handbook covers the underlying mechanism in
[Narrowing → Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking).

The prescriptive counterpart of these conventions, with full examples of the allowed and disallowed
forms, lives in `.claude/rules/code-quality/typescript/exhaustiveness.md` and
`.github/instructions/code-quality/typescript/exhaustiveness.instructions.md`.
