---
paths:
  - '**/*.{ts,tsx}'
description:
  'Unsafe type coercion: `unknown` over `any`, validating at boundaries, and the narrow type-level
  cases where an assertion is legitimate'
---

<!-- Parity: keep in sync with .github/instructions/code-quality/typescript/type-coercion.instructions.md -->

# Unsafe Type Coercion

## The Rule

Validate everything. Nothing is ever assumed. Every value whose type the compiler did not derive
from code in this repository — an API response, a parsed JSON blob, a caught error, a route
parameter, an environment variable, a fixture file — is untrusted until a runtime check has
established its shape.

Three requirements, in order:

1. A value of unknown shape is typed **`unknown`**, never `any`.
2. It is narrowed by a real runtime check — a type guard, an assertion function, or a schema —
   before a single property is read from it.
3. A type assertion (`as`) is **never** used to skip step 2.

The third requirement is absolute. A dangerous type coercion is not permitted under any
circumstances: not "just this once", not "I know it is a string here", not behind a comment
promising that the author checked. There is no `as unknown as T` double-assertion escape hatch, and
there is no volume of confidence that substitutes for a check the program can actually perform.

```typescript
// Disallowed: nothing verified any of this. The program is now typed as though it had.
const skill = payload as Skill;
const label = (payload as { readonly label: string }).label;
const client = undefined as unknown as PrismaClient;

// Correct: the schema performs the check, and the type comes out of the check rather than around it.
const parsed = SkillJsonSchema.safeParse(payload);
if (!parsed.success) {
  throw new TypeError(`The skill payload is invalid: ${parsed.error.message}`);
}
const label = parsed.data.label;
```

The narrow set of positions where an assertion is unavoidable is enumerated in
[Where an Assertion Is Legitimate](#where-an-assertion-is-legitimate). Every one is a **type-level**
position where the compiler cannot see something a reader can. None involve asserting the shape of
runtime data.

## `unknown`, Never `any`

`any` disables type checking for the value and for everything derived from it. `unknown` keeps the
value in the type system and forces it to be narrowed before use. They are not two flavors of the
same idea: one removes the checker, the other defers to it.

```typescript
// Disallowed: `any` propagates. `crated_at` is a typo for `created_at`, and it compiles anyway.
const data: any = await response.json();
const startDate = new Date(data[0].crated_at);

// Correct: `unknown` permits no operations at all until the value has been narrowed, so the typo
// is impossible to write.
const data: unknown = await response.json();
const parsed = z.array(GithubRepoSchema).safeParse(data);
```

The rule holds for type-guard parameters, caught errors, and generic defaults alike:

```typescript
// Correct: the parameter is `unknown`, so the guard body is forced to do the checking.
// From `src/lib/typeguards.ts`.
export const isRecordType = (value: unknown): value is Record<string, unknown> =>
  z.record(z.any()).safeParse(value).success;

// Disallowed: the parameter type defeats the point of the guard. The body can read anything off
// `value` without checking it, and callers can pass anything at all.
export const isRecordType = (value: any): value is Record<string, unknown> =>
  typeof value === 'object';
```

`@typescript-eslint/no-explicit-any` is an error and is in the `Never` category. Its one documented
exemption is **type inference** over function argument or return types, spelled out in the ESLint
rule in the parent `code-quality/` directory (`eslint.md` for Claude Code, `eslint.instructions.md`
for Copilot) and already covered by `ignoreRestArgs: true`:

```typescript
// Correct: an inference position, where no more specific type expresses the constraint.
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
```

Outside of inference, `any` is never written and never disabled.

## What a Type Assertion Actually Does

An assertion is a compile-time instruction and nothing else — it is erased before the code runs, so
a wrong assertion produces no exception and no `null`, only a value that does not match its type.

The only safety net is the specificity rule, which rejects an assertion between two types that do
not overlap. That check compares the two _types_; it says nothing about the _value_, and an
assertion from `unknown` to anything at all passes it trivially:

```typescript
const status = 'active' as number;

/* Error: "Conversion of type 'string' to type 'number' may be a mistake because neither type
   sufficiently overlaps with the other. If this was intentional, convert the expression to
   'unknown' first." */
```

### The Double Assertion Is Not a Workaround

`expr as any as T` and `expr as unknown as T` exist solely to defeat that check. Both are disallowed
outright. The error being suppressed is the compiler reporting that the two types have nothing to do
with each other, which is information rather than an obstacle.

```typescript
// Disallowed: the two-step assertion defeats an overlap check that was telling the truth.
const repos = data as unknown as GithubRepo[];

// Disallowed: this lies about a value that is genuinely absent, so every dereference is unchecked.
return undefined as unknown as PrismaClient;

// Correct: the value really may be absent, so the type says so and the caller handles it.
const resolveDb = (): null | PrismaClient => (typeof window === 'undefined' ? initialize() : null);
```

When a double assertion looks necessary the actual problem is one of three things, each with a real
fix: the value has not been validated (validate it), the declared type is wrong (fix the type), or
the value is optional and the type refuses to say so (add `| null`).

### Non-Null Assertions Are the Same Mistake

`value!` is a type assertion in miniature, rejected by `@typescript-eslint/no-non-null-assertion`.
Use `assertDefined` or `ensuresDefinedValue` from `src/lib/typeguards.ts`.

```typescript
// Disallowed: it advertises that the author considered the absence case and dismissed it.
return record!.id;

// Correct: the check exists, and it throws with a message when it fails.
assertDefined(record);
return record.id;
```

## Where an Assertion Is Legitimate

An assertion is legitimate when **the compiler cannot verify the claim but a reader can**, and it
carries a comment saying why the claim is sound. Justifying a coercion is the canonical legitimate
use of an inline comment under the code-comments rule in the parent `code-quality/` directory
(`code-comments.md` for Claude Code, `code-comments.instructions.md` for Copilot).

Every legitimate case is a **type-level** limitation. None is about runtime data:

```typescript
// Disallowed: a comment does not make an unvalidated coercion sound. The claim is about runtime
// data, which is a claim only a runtime check can make.
/* The GitHub API always returns this shape. */
return data as GithubRepo[];
```

### Generic Returns the Compiler Cannot Prove

Inside a generic function the type parameter is unresolved, so a concrete value the body produces
cannot be proven to satisfy it — the parameter could be instantiated with any subtype of its
constraint. `parseStringUnitlessSize` in `src/components/types/sizes.ts` is the repository's
example: its return type is a conditional over the options object, so the `null` returned in the
non-strict branch is not assignable to the unresolved conditional.

```typescript
type ParsedStringUnitlessSize<O extends { strict?: boolean }> = O extends { strict: false }
  ? null | number
  : number;

export const parseStringUnitlessSize = <O extends { strict?: boolean }>(
  value: string,
  opts?: O,
): ParsedStringUnitlessSize<O> => {
  if (opts?.strict !== false) {
    throw new TypeError(`The provided size, '${value}', is invalid!`);
  }
  /* Reaching this return means `strict` was passed as `false`, which resolves the conditional
     return type to `null | number`. `O` is still unresolved here, so the checker cannot make that
     connection on its own. */
  return null as ParsedStringUnitlessSize<O>;
};
```

Written as a bare `return null`, the compiler reports
`Type 'null' is not assignable to type 'ParsedStringUnitlessSize<O>'`, because it must assume `O`
could be `{ strict: true }`. That is the pattern in general: **the branch the compiler cannot pick
has already been picked by a check the compiler did run.**

### Conditional Return Types Correlated With a Parameter

The same limitation appears when narrowing a parameter ought to narrow the return type but does not
— a type guard narrows the value it is applied to, not a conditional type computed over a type
parameter. `sizeToString`, in the same module:

```typescript
export function sizeToString<T extends QuantitativeSize | UnitlessSize, U extends SizeUnit>(
  size: T,
  unit?: U,
): SizeToStringRT<T, U> {
  if (isQualitativeSize(size) || isQuantitativeSizeString(size, {})) {
    /* The guards have established that `T` falls in the branch of `SizeToStringRT` that resolves
       to `T` itself, but the narrowing applies to `size` and not to the return type. */
    return size as SizeToStringRT<T, U>;
  }
  /* ... */
}
```

Before reaching for the assertion, check whether an **overload set** expresses the correlation
instead. `HttpClient` in `src/integrations/http/http-client.ts` declares four overloads per method
so that callers get an exact return type with no assertion at the call site. Overloads are preferred
when the argument shapes are a small enumerable set; a conditional return type with an internal
assertion is for when the set is open.

### Type Inference Boundaries

A function or class body does not see the types inferred at the call site, so members computed from
a generic shape are opaque inside the body even though they are exact outside it. `HttpClient` is
generic over its processor configuration `P`:

```typescript
/* `P` is unresolved inside the class body, so the stored processor cannot be related to the
   response data type computed from it, even though they are the same type at every call site. */
const processor = this.config.processors.okayResponseProcessor as
  ClientOkResponseProcessor<HttpClientProcessedResponseData<P>> | undefined;
```

The same file throws `error as Error` for the same reason: every member of the error union extends
`Error`, but they are conditional types the compiler cannot resolve to an `Error` subclass there.
Both assertions restate something the surrounding declaration already guarantees, and neither
describes a runtime value.

### `as const` Is a Const Assertion, Not a Type Assertion

`as const` shares the keyword and nothing else. It asserts nothing about a value; it instructs the
compiler to infer the narrowest type the literal supports and mark it `readonly`. It can never be
wrong, and it is always fine.

```typescript
// Correct: `SizeUnits` is inferred as `readonly ['%', 'px', 'rem']` rather than `string[]`, which
// is what makes the derived union exact.
export const SizeUnits = ['%', 'px', 'rem'] as const;

export type SizeUnit = (typeof SizeUnits)[number];
```

### Prefer `satisfies` Wherever It Can Do the Job

`satisfies` validates an expression against a type **without** widening it and without asserting
anything. Where `as` says "treat this as `T`", `satisfies` says "check that this is a `T`, and leave
its type alone". Whenever both would compile, `satisfies` is required.

```typescript
// Disallowed: the assertion widens every value, so nothing downstream knows `search` is a string —
// and the object was never really checked, only compared for overlap.
const Filters = { search: 'react', skills: ['typescript'] } as Record<string, FilterValue>;

// Correct: every value is verified and inference is untouched, so `Filters.search` is still
// `string` and `Filters.skills` is still `string[]`.
const Filters = { search: 'react', skills: ['typescript'] } satisfies Record<string, FilterValue>;
```

An assertion on an object literal also suppresses the excess-property check, so a misspelled key
compiles; `satisfies` reports it. The three forms are distinct and the choice is not stylistic:

| Form                                     | What it does                                         |
| ---------------------------------------- | ---------------------------------------------------- |
| `const x: T = value`                     | Checks, and widens `x` to `T`.                       |
| `const x = value satisfies T`            | Checks, and leaves `x` at its inferred type.         |
| `const x = value as T` **(last resort)** | Checks nothing beyond overlap; forces `x` to be `T`. |

`as const satisfies T` combines both halves and is the standard form for a lookup table whose
literal values matter — `src/actions/types/search.ts` and `src/database/fixtures/schemas.ts` both
use it.

## Validating Unknown Data

Step 2 of the rule has two acceptable implementations, and the choice is about the size of the
shape, not preference.

**A hand-written guard** is proportionate when the shape has one or two properties and the check
reads as one expression. Signatures, naming, totality, and cast direction are governed by the
type-guards rule in this same directory (`type-guards.md` for Claude Code,
`type-guards.instructions.md` for Copilot).

```typescript
// From `src/api/client.ts`.
const isSuccessResponseBody = (b: unknown): b is { readonly data: SuperJSON.SuperJSONResult } =>
  typeof b === 'object' && b !== null && 'data' in b && isSuperJsonResult(b.data);
```

**A Zod schema** is required for anything larger — nested shapes, many fields, or any trust boundary
(the network, the file system, the database, a form submission, a URL). Hand-rolling those checks is
disallowed, because a hand-rolled check over a large shape is never total in practice:

```typescript
// Disallowed: one of twelve fields is checked, and only for presence rather than for type. The
// predicate promises the whole shape anyway, and nothing will ever report that it does not hold.
const isJsonSkill = (value: unknown): value is JsonSkill =>
  typeof value === 'object' && value !== null && 'label' in value;
```

`src/database/fixtures/schemas.ts` holds the repository's schemas. A schema composes with a guard
when a boolean is what the call site wants, as `isUuid` in `src/lib/typeguards.ts` does.

### `safeParse` Versus `parse`

Use **`safeParse`** whenever the failure is a case the caller handles — a bad request body, an
invalid URL filter, a malformed response. It returns a discriminated result rather than throwing, so
the failure path is written out and type-checked. This is what the server actions do.

Use **`parse`** only where an invalid value is a programming or deployment error with no sensible
way to continue: a fixture that ships with the repository, or configuration read at boot. `parse`
inside a request handler is disallowed — it converts a client's bad input into an unhandled
exception and a 500.

Never discard the failure. `safeParse(value).success` as a bare boolean is correct inside a type
guard, where the boolean _is_ the answer; anywhere else, `parsed.error` carries the field-level
detail the user or the log needs.

### Derive the Type From the Schema

The schema is the single source of truth for the shape. The TypeScript type is derived from it with
`z.infer`, never declared alongside it — two declarations that must be kept in step have nothing
that notices when they diverge.

```typescript
// Correct: one declaration. Adding a field to the schema adds it to the type, and every consumer
// updates with it. From `src/database/fixtures/schemas.ts`.
export const DetailJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  label: NonNullableStringField({}),
  nestedDetails: z.array(NestedDetailJsonSchema).optional(),
});

export type JsonDetail = z.infer<typeof DetailJsonSchema>;
```

This is the same principle as "declare the array, derive the type" in the type-guards rule: the
runtime artifact is the definition, and every type expressed about it is computed from it. Where a
function's input is a schema-backed shape, type the parameter from the schema too.

## HTTP Responses

### `Response.json()` Returns `Promise<any>`

The DOM library declares it that way — `json(): Promise<any>` in `lib.dom.d.ts`. Every
`await res.json()` therefore produces an `any` at the exact boundary where the least is known about
the value, and that `any` spreads through everything computed from it. Whether the linter can still
see it depends entirely on the annotation written next to the call.

```typescript
// Disallowed: `user` is an `any` wearing a `User` annotation. Nothing was checked. This at least
// still reports "Unsafe assignment of an `any` value." under
// `@typescript-eslint/no-unsafe-assignment`.
const user: User = await res.json();

// Disallowed, and worse: the assertion makes the expression's type `User`, so the linter has
// nothing left to report. The only signal that this value was never validated is now gone.
const user = (await res.json()) as User;
```

### The Required Pattern

Annotate the awaited result `unknown`, then validate. Assigning `any` to `unknown` is explicitly
permitted by `no-unsafe-assignment`, and it is the one place the `any` is allowed to be absorbed,
because `unknown` permits no operations until the value is narrowed.

```typescript
// Correct: the `any` is contained at the boundary, and the `User` comes out of the schema rather
// than out of an annotation.
const body: unknown = await res.json();

const parsed = UserSchema.safeParse(body);
if (!parsed.success) {
  return { error: new HttpSerializationError({ method: 'GET', status: res.status, url }) };
}
return parsed.data;
```

The `const body: unknown = ...` annotation is not optional and not a formality. Without it the `any`
escapes into the `safeParse` call and `@typescript-eslint/no-unsafe-argument` reports it.
`src/api/client.ts` and `src/integrations/github/client.ts` both write it.

### Check `res.ok` First, and Wrap the Parse

Two facts about `fetch` that the type system does not express:

- A non-2xx response still resolves. `fetch` only rejects on a network failure, so `res.ok` must be
  checked before the body is read.
- A non-2xx body is an **error payload**, not the success shape. Validating it against the success
  schema is guaranteed to fail and reports the wrong problem.

`Response.json()` also rejects with a `SyntaxError` when the body is not JSON at all, which happens
routinely — a proxy error page, a framework 404, a redirect to a sign-in page. The call goes in a
`try`.

```typescript
// Correct: status first, then a guarded parse, then validation. This is the shape
// `src/api/client.ts` implements across its two response processors.
const res = await fetch(url);
if (!res.ok) {
  return { error: await processErrorResponse(res) };
}

let body: unknown;
try {
  body = await res.json();
} catch {
  return { error: new HttpSerializationError({ method: 'GET', status: res.status, url }) };
}

const parsed = UserSchema.safeParse(body);
```

```typescript
// Disallowed: three separate failures — a 500's error body is parsed as a `User`, a non-JSON body
// throws out of the function uncaught, and the assertion means none of it would be noticed.
const res = await fetch(url);
return (await res.json()) as User;
```

## The ESLint Rules That Enforce This

Every rule below is configured as `error` in `tooling/eslint-config-web/configs/typescript.mjs`.
They are not seven opinions about `any`; they are one perimeter. `no-explicit-any` stops the type
from being written, and the six `no-unsafe-*` rules stop an `any` that arrived from a third-party
declaration — `Response.json()` above being the standard case — from doing anything at all. Each
rule closes one exit: storing the value, passing it, reading from it, calling it, returning it.
Disabling any single one reopens the whole chain downstream of that point.

| Rule                                         | What it catches                                 |
| -------------------------------------------- | ----------------------------------------------- |
| `@typescript-eslint/no-explicit-any`         | The `any` type being written at all.            |
| `@typescript-eslint/no-unsafe-assignment`    | _"Unsafe assignment of an `any` value."_        |
| `@typescript-eslint/no-unsafe-argument`      | An `any` reaching a typed parameter.            |
| `@typescript-eslint/no-unsafe-member-access` | _"Unsafe member access ... on an `any` value."_ |
| `@typescript-eslint/no-unsafe-call`          | An `any` invoked as a function.                 |
| `@typescript-eslint/no-unsafe-return`        | _"Unsafe return of an `any` typed value."_      |
| `@typescript-eslint/no-non-null-assertion`   | `value!` — _"Forbidden non-null assertion."_    |

Of the seven, only `no-unsafe-member-access` appears in the disable catalog in the ESLint rule in
the parent `code-quality/` directory (`eslint.md` for Claude Code, `eslint.instructions.md` for
Copilot), and only in test files. The rest are `Never`.

Note what the table does not contain: there is no lint rule that reports a plain `as`. The linter
sees an assertion as a well-typed expression, so nothing in the toolchain will catch a coercion that
is wrong. That is precisely why the rule at the top of this document is a rule and not a preference.

## Applying the Convention

These rules govern new code and deliberate restructures. Parts of the codebase predate them and must
not be swept as a side effect of unrelated work:

- `src/integrations/github/client.ts` asserts an entire unvalidated API response
  (`return data as types.GithubRepo<U>[]`). The `GithubRepo` type describes dozens of fields, none
  of which are checked. This is the exact pattern the HTTP section forbids, and it is the first
  place a schema should be introduced when that client is next touched.
- `src/database/prisma/client/index.ts` returns `undefined as unknown as PrismaClient` in the
  browser branch, and `src/internal/logger.ts` re-types `globalThis` with the same double assertion.
- `src/api/client.ts` and `src/integrations/http/http-client.ts` disable `no-explicit-any` on
  processor type parameters that are inference positions in practice but are not covered by the
  `ignoreRestArgs` exemption.
- `src/components/types/sizes.ts` contains the legitimate generic and conditional-return assertions
  quoted above alongside guards that cast against a bare literal array; only the latter are
  violations, and they are covered by the type-guards rule in this same directory.

When a boundary, a guard, a schema, or an assertion is already being added, moved, or rewritten,
bring it into conformance as part of that change.

## Further Reading

- TypeScript's handbook on
  [type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions),
  including the specificity rule and the double-assertion workaround this repository disallows.
- The TypeScript 3.0 release notes on the
  [`unknown` top type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type).
- The TypeScript 4.9 release notes on
  [the `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator).
- The handbook on
  [working with constrained values](https://www.typescriptlang.org/docs/handbook/2/functions.html#working-with-constrained-values),
  which explains why a generic body cannot produce a value of its own type parameter.
- typescript-eslint on [`no-explicit-any`](https://typescript-eslint.io/rules/no-explicit-any/).
