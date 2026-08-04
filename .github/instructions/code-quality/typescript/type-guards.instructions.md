---
applyTo: '**/*.{ts,tsx}'
description:
  'Type guards and assertion functions: signatures, cast direction, and deriving unions from arrays'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/typescript/type-guards.md -->

# Type Guards & Assertion Functions

## Narrow, Never Cast

A value whose type is not yet known must be narrowed by a **type guard** or an **assertion
function**, never by a type assertion (`as`) at the point of use. A bare `value as Foo` tells the
compiler to stop checking; a guard performs a real runtime check and earns the narrowing.

```typescript
// Disallowed: nothing verified that the payload has this shape.
const status = (payload as { readonly status: Status }).status;

// Correct: the guard checks at runtime, and the compiler narrows on the strength of that check.
if (isStatusPayload(payload)) {
  const status = payload.status;
}
```

Non-null assertions (`value!`) are a special case of the same mistake and are rejected outright by
`@typescript-eslint/no-non-null-assertion`. Use `assertDefined` or `ensuresDefinedValue` from
`src/lib/typeguards.ts` instead.

## Type Guard Signature

A type guard is a function whose return type is a type predicate, `value is X`:

```typescript
export const isHttpError = (value: unknown): value is HttpError => /* ... */;
```

- Name it `isX`, matching the type it narrows to. When the subject is not the grammatical subject of
  an `is` phrase, a descriptive verb form is acceptable — `sidebarItemHasChildren`,
  `sidebarItemIsExternal` in `src/components/layout/types.ts`.
- Type the parameter `unknown` when the value's type is genuinely unknown (an API response, a parsed
  JSON blob, a caught error). Never type it `any`.
- Type the parameter as the **wider known type** when narrowing within a union, so the guard cannot
  be called with something unrelated. `src/components/input/select/types.ts` does this:

  ```typescript
  export const isClearable = (behavior: SelectBehaviorType): behavior is ClearableSelectBehavior =>
    behavior === 'multi' || behavior === 'single-nullable';
  ```

- A guard must be **total**: the boolean it returns must be true for every member of `X` and false
  for everything else. A guard that returns `false` for a legitimate member is a silent bug that the
  compiler cannot catch, because a type predicate is an unchecked promise the function makes.

## Finite Unions: Derive the Type from the Array

A union type with a finite set of string members must be declared as a `readonly` array first, with
the type derived from it. The array is then the single source of truth for both the type and every
runtime check over it.

```typescript
export const SizeUnits = ['%', 'px', 'rem'] as const;

export type SizeUnit = (typeof SizeUnits)[number];

export const isSizeUnit = (value: unknown): value is SizeUnit =>
  SizeUnits.includes(value as SizeUnit);
```

Declaring the type and the array separately is disallowed, because nothing keeps them aligned:

```typescript
// Disallowed: adding 'em' to the type leaves the guard silently rejecting it, and adding 'em' to
// the array leaves it absent from the type. Neither mistake is a compile error.
export type SizeUnit = '%' | 'px' | 'rem';

export const isSizeUnit = (value: unknown): value is SizeUnit =>
  ['%', 'px', 'rem'].includes(value as string);
```

This also makes the union enumerable at runtime, which is what lets it be mapped over for select
options, validated against, or iterated in a test that asserts every member is handled.

### Subset Arrays Checked Against a Parent Union

When the array is a subset of a larger union, constrain it with
`as const satisfies readonly Parent[]`. The `satisfies` clause verifies every entry is a real member
of the parent while `as const` keeps the literal types, so the derived subset type stays exact:

```typescript
export const TabledBrands = [
  'company',
  'course',
  'education',
  'experience',
  'skill',
] as const satisfies readonly Brand[];

export type TabledBrand = (typeof TabledBrands)[number];

export const isTabledBrand = (value: unknown): value is TabledBrand =>
  TabledBrands.includes(value as TabledBrand);
```

Renaming a member of `Brand` upstream now fails to compile at the array, which is the point.

### Prefer `enumeratedLiterals` Where It Fits

This repository depends on `enumerated-literals`, and `src/database/model/` uses it throughout. An
`enumeratedLiterals` instance produces the member type, the members array, a `.contains()` type
guard, and an `.assert()` assertion function from one declaration, which satisfies everything above
without hand-writing any of it. Reach for it first when defining a new finite union of string
members; hand-write the array-and-guard pattern when the union is a subset of an existing type, or
when the value comes from somewhere the literals instance cannot own (a Prisma enum, a third-party
type).

## Cast Direction: Cast the Value, Never the Reference

`Array.prototype.includes` on a `readonly` tuple of literals only accepts an argument assignable to
the element type, so a guard taking `unknown` will not type-check without an assertion somewhere.
The assertion must go on the **value being checked**, never on the array being checked against.

```typescript
// Correct: the cast is confined to the argument position.
export const isSizeUnit = (value: unknown): value is SizeUnit =>
  SizeUnits.includes(value as SizeUnit);

// Disallowed: the cast is applied to the source of truth.
export const isSizeUnit = (value: unknown): value is SizeUnit =>
  (SizeUnits as readonly string[]).includes(value as string);
```

Both compile. They are not equivalent:

- Casting the array **discards the very type information the array exists to carry**. `SizeUnits` is
  the definition of `SizeUnit`; widening it to `readonly string[]` at the call site means the check
  is no longer connected to the type it claims to prove. If the array's element type later changes —
  it becomes a tuple of objects, or a different literal union — the widening cast keeps compiling
  while the guard quietly stops meaning anything.
- Casting the argument is **discharged by the call itself**. The assertion `value as SizeUnit` is
  unsound for exactly the duration of the argument expression; the moment `includes` returns `true`,
  the assumption has been verified at runtime, and that is precisely the fact the type predicate
  reports. The unsoundness is local and immediately paid for.
- The type error TypeScript raises here is a **signal, not an obstacle**. It is asking "is this
  value plausibly a member?" — a question about the value. Answering it by rewriting the array is
  answering a different question.

The same rule holds for every comparison in a guard: `Object.keys`, `Set.prototype.has`, `indexOf`,
and a `switch` over the members all narrow the value, so any assertion needed to satisfy them
belongs on the value.

## Guards Over Object Shapes

For object shapes, check discriminants and property presence rather than asserting the whole shape.
`src/components/layout/types.ts` uses the `in` operator, which narrows natively:

```typescript
const isShowProps = (props: ShowHideProps): props is ShowProps => 'show' in props;
```

When validation is non-trivial, delegate to the schema library rather than hand-rolling the checks —
`src/lib/typeguards.ts` does this with Zod:

```typescript
export const isRecordType = (value: unknown): value is Record<string, unknown> =>
  z.record(z.any()).safeParse(value).success;
```

### Format Validation Needs a Branded Type

A guard that validates the **format** of a value rather than its type cannot narrow to the same type
it accepts. `isUuid(value: string): value is string` is meaningless: the true branch narrows
`string` to `string`, and the false branch narrows it to `never`, so the invalid values the branch
exists to report are no longer usable as strings.

Brand the validated type so it is a strict subtype. `src/lib/typeguards.ts` is the reference:

```typescript
declare const uuidBrand: unique symbol;

export type Uuid = { readonly [uuidBrand]: true } & string;

export const isUuid = (value: unknown): value is Uuid => z.string().uuid().safeParse(value).success;
```

## Assertion Functions

An assertion function narrows by throwing instead of by returning a boolean. Its return type is
`asserts value is X`, and the narrowing applies to every statement after the call.

Use an assertion function when the value **must** be of the type for execution to continue — the
alternative branch is a bug, not a case to handle. Use a type guard when both branches are
legitimate control flow.

```typescript
// Correct: control flow branches on the result, so a guard.
if (isClearable(behavior)) {
  renderClearButton();
}

// Correct: continuing without a defined value is a programming error, so an assertion.
assertDefined(record);
return record.id;
```

### Declaration Form

TypeScript requires that a call target for an assertion be declared with an explicit type
annotation. An assertion written as an arrow function assigned to a `const` therefore needs a
declared type on the variable, or every call site fails with _"Assertions require every name in the
call target to be declared with an explicit type annotation."_ Declare the signature as a named type
alias and annotate the constant with it, as `src/lib/typeguards.ts` does:

```typescript
type AssertDefined = <V>(value: undefined | V) => asserts value is V;

export const assertDefined: AssertDefined = <V>(value: undefined | V): asserts value is V => {
  if (value === undefined) {
    throw new TypeError('Unexpectedly encountered undefined value!');
  }
};
```

A `function` declaration needs no separate alias and is equally acceptable:

```typescript
export function assertIsStatus(value: unknown): asserts value is Status {
  if (!isStatus(value)) {
    throw new TypeError(`Expected a status, but received '${String(value)}'.`);
  }
}
```

### Rules for Assertion Functions

- Name it `assertX`, matching the type it asserts.
- Implement it in terms of the corresponding type guard where one exists, so the runtime check has
  exactly one definition. Do not duplicate the predicate logic in both.
- Throw a `TypeError` (or a domain error) whose message names what was expected and reports the
  value received. An assertion that throws a bare `Error('Invalid')` gives up the only advantage it
  has over a silent cast.
- When a value is needed as an expression rather than as a narrowed binding, use the
  return-the-value wrapper instead of an inline assertion — `ensuresDefinedValue` in
  `src/lib/typeguards.ts` is the existing example.

## Applying the Convention

These rules govern new guards, new assertions, and new finite unions, along with deliberate
restructures. Parts of the codebase predate them — `src/components/types/sizes.ts` declares its
unions separately from the arrays its guards check against — and must not be swept as a side effect
of unrelated work. When a guard or a union declaration is already being added, moved, or rewritten,
bring it into conformance as part of that change.

## Further Reading

TypeScript's official documentation on
[narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html), specifically the
sections on
[type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
and
[assertion functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions).
