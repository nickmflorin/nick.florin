# Type Guards & Assertion Functions

Conventions for narrowing values whose type is not yet known, and for declaring the finite unions
those checks operate over.

## Narrow Rather Than Cast

A value of unknown shape is narrowed with a type guard or an assertion function, not with an `as`
cast at the point of use. A cast tells the compiler to stop checking; a guard performs a real
runtime check and earns the narrowing:

```typescript
// Disallowed: nothing verified that the payload has this shape.
const status = (payload as { readonly status: Status }).status;

// Correct: the guard checks at runtime, and the compiler narrows on the strength of that check.
if (isStatusPayload(payload)) {
  const status = payload.status;
}
```

Non-null assertions (`value!`) are the same mistake in miniature and are rejected by
`@typescript-eslint/no-non-null-assertion` — `assertDefined` and `ensuresDefinedValue` in
[src/lib/typeguards.ts](../../../src/lib/typeguards.ts) cover that case.

A type guard is a function returning a type predicate, `value is X`, named `isX` after the type it
narrows to. Its parameter is `unknown` when the value's type is genuinely unknown, or the wider
known type when narrowing within a union:

```typescript
// The value's type is genuinely unknown — an API response, a parsed blob, a caught error.
export const isHttpError = (value: unknown): value is HttpError => /* ... */;

// Narrowing within a known union, so the guard cannot be called with something unrelated.
// From `src/components/input/select/types.ts`.
export const isClearable = (behavior: SelectBehaviorType): behavior is ClearableSelectBehavior =>
  behavior === 'multi' || behavior === 'single-nullable';
```

Because a type predicate is an unchecked promise, a guard has to be **total**: true for every member
of `X`, false for everything else. A guard that rejects a legitimate member is a bug the compiler
cannot see.

## Declare the Array, Derive the Type

A finite union of string members is declared as a `readonly` array first, with the type derived from
it, so that the array is the single source of truth for both the type and every runtime check over
it:

```typescript
export const SizeUnits = ['%', 'px', 'rem'] as const;

export type SizeUnit = (typeof SizeUnits)[number];

export const isSizeUnit = (value: unknown): value is SizeUnit =>
  SizeUnits.includes(value as SizeUnit);
```

Declaring the type and the array independently leaves two things that have to be kept in step, and
nothing that notices when they diverge:

```typescript
// Disallowed: adding 'em' to the type leaves the guard silently rejecting it, and adding 'em' to
// the array leaves it absent from the type. Neither mistake is a compile error.
export type SizeUnit = '%' | 'px' | 'rem';

export const isSizeUnit = (value: unknown): value is SizeUnit =>
  ['%', 'px', 'rem'].includes(value as string);
```

Deriving one from the other also makes the union enumerable at runtime, which is what allows it to
be mapped into select options or iterated in a test.

When the array is a subset of a larger union, `as const satisfies readonly Parent[]` checks each
entry against the parent while keeping the literal types, so the derived subset stays exact and
renaming a parent member is a compile error:

```typescript
export const TabledBrands = ['company', 'course', 'skill'] as const satisfies readonly Brand[];

export type TabledBrand = (typeof TabledBrands)[number];
```

This repository depends on `enumerated-literals`, used throughout `src/database/model/`, which
produces the member type, the members array, a `.contains()` guard, and an `.assert()` assertion
from a single declaration. It is the first thing to reach for when defining a new finite union; the
hand-written array pattern is for subsets of existing types and for values owned elsewhere, such as
a Prisma enum.

## Cast the Value, Never the Reference

`Array.prototype.includes` on a `readonly` tuple of literals only accepts an argument assignable to
the element type, so a guard taking `unknown` needs an assertion somewhere. It belongs on the value
being checked, never on the array being checked against:

```typescript
// Correct: the cast is confined to the argument position.
export const isSizeUnit = (value: unknown): value is SizeUnit =>
  SizeUnits.includes(value as SizeUnit);

// Disallowed: the cast is applied to the source of truth.
export const isSizeUnit = (value: unknown): value is SizeUnit =>
  (SizeUnits as readonly string[]).includes(value as string);
```

Both compile, and they are not equivalent. Casting the array discards the very type information the
array exists to carry: `SizeUnits` _is_ the definition of `SizeUnit`, and widening it to
`readonly string[]` disconnects the check from the type it claims to prove, so a later change to the
array's element type leaves the guard compiling and meaning nothing. Casting the argument, by
contrast, is unsound only for the duration of the argument expression — the moment `includes`
returns `true`, the assumption has been verified at runtime, which is precisely the fact the
predicate reports.

The type error TypeScript raises here is a signal rather than an obstacle. It asks whether the value
is plausibly a member, a question about the value; rewriting the array answers a different question.

## Object Shapes and Format Validation

For object shapes, check discriminants and property presence rather than asserting the whole thing.
The `in` operator narrows natively, and non-trivial validation delegates to Zod:

```typescript
// From `src/components/util/ShowHide.tsx`.
const isShowProps = (props: ShowHideProps): props is ShowProps => 'show' in props;

// From `src/lib/typeguards.ts`.
export const isRecordType = (value: unknown): value is Record<string, unknown> =>
  z.record(z.any()).safeParse(value).success;
```

A guard that validates the **format** of a value rather than its type needs a branded type to narrow
to. `isUuid(value: string): value is string` is meaningless — the true branch narrows `string` to
`string` and the false branch to `never`, so the invalid values that branch exists to report stop
being usable as strings. Branding makes the validated type a strict subtype:

```typescript
// From `src/lib/typeguards.ts`, whose JSDoc explains the reasoning in full.
declare const uuidBrand: unique symbol;

export type Uuid = { readonly [uuidBrand]: true } & string;

export const isUuid = (value: unknown): value is Uuid => z.string().uuid().safeParse(value).success;
```

## Assertion Functions

An assertion function narrows by throwing rather than by returning a boolean, with the return type
`asserts value is X`. Use one when the value must be of the type for execution to continue — the
alternative is a bug, not a case to handle. Use a guard when both branches are legitimate control
flow:

```typescript
// Control flow branches on the result, so a guard.
if (isClearable(behavior)) {
  renderClearButton();
}

// Continuing without a defined value is a programming error, so an assertion.
assertDefined(record);
return record.id;
```

TypeScript requires an explicit type annotation on the call target, so an assertion written as an
arrow function assigned to a `const` needs a named type alias on the variable. Without it, every
call site fails with _"Assertions require every name in the call target to be declared with an
explicit type annotation."_

```typescript
// Correct: the alias supplies the explicit annotation the call sites need.
// From `src/lib/typeguards.ts`.
type AssertDefined = <V>(value: undefined | V) => asserts value is V;

export const assertDefined: AssertDefined = <V>(value: undefined | V): asserts value is V => {
  if (value === undefined) {
    throw new TypeError('Unexpectedly encountered undefined value!');
  }
};

// Correct: a `function` declaration needs no alias.
export function assertIsStatus(value: unknown): asserts value is Status {
  if (!isStatus(value)) {
    throw new TypeError(`Expected a status, but received '${String(value)}'.`);
  }
}
```

An assertion is named `assertX`, is implemented in terms of the corresponding guard where one exists
so the runtime check has one definition, and throws an error naming both what was expected and what
arrived. An assertion throwing a bare `Error('Invalid')` has given up the only advantage it holds
over a silent cast.

## Reference

TypeScript's handbook covers
[type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates),
and the 3.7 release notes cover
[assertion functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions).

The prescriptive counterpart of these conventions lives in
`.claude/rules/code-quality/typescript/type-guards.md` and
`.github/instructions/code-quality/typescript/type-guards.instructions.md`.
