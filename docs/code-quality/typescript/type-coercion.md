# Unsafe Type Coercion

Conventions for values the compiler cannot vouch for, and for the narrow set of positions where a
type assertion is the only thing that will do.

## Validate Everything

Nothing is assumed. A value that did not come from code in this repository — an API response, a
parsed JSON blob, a caught error, a route parameter, an environment variable, a fixture file — is
untrusted until a runtime check has established its shape. The type it is given afterwards comes
_out of_ that check rather than being placed on top of it:

```typescript
// Disallowed: nothing verified any of this. The program is now typed as though it had.
const skill = payload as Skill;

// Correct: the schema performs the check, and the type is what the check produced.
const parsed = SkillJsonSchema.safeParse(payload);
if (!parsed.success) {
  throw new TypeError(`The skill payload is invalid: ${parsed.error.message}`);
}
const label = parsed.data.label;
```

A dangerous coercion is never permitted, and the exceptions people reach for are not exceptions.
"Just this once", "I know it is a string here", and a comment promising the author checked all
describe the same thing: a claim about runtime data made by something that does not run. There is no
`as unknown as T` escape hatch either — the double assertion exists only to defeat the one check
TypeScript still performs.

## `unknown` Rather Than `any`

`any` removes the type checker for the value and for everything computed from it. `unknown` keeps
the value in the type system and refuses every operation until it is narrowed. This is why `unknown`
is always used in place of `any`:

```typescript
// Disallowed: `crated_at` is a typo, and so is anything else written here. All of it compiles.
const data: any = await response.json();
const startDate = new Date(data[0].crated_at);

// Correct: nothing can be read off `data` until a check has been performed, so the typo cannot be
// written in the first place.
const data: unknown = await response.json();
const parsed = z.array(GithubRepoSchema).safeParse(data);
```

`@typescript-eslint/no-explicit-any` enforces this as an error. Its one exemption is type inference
over call signatures, where no more specific type expresses the constraint, and the rule is
configured with `ignoreRestArgs: true` so the common form needs no directive:

```typescript
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
```

## What an Assertion Costs

An assertion is erased at compile time. The handbook is blunt about it: _"there is no runtime
checking associated with a type assertion. There won't be an exception or `null` generated if the
type assertion is wrong."_ The only thing standing behind it is TypeScript's overlap check, which
compares two types and says nothing whatsoever about the value:

```typescript
const status = 'active' as number;

/* Error: "Conversion of type 'string' to type 'number' may be a mistake because neither type
   sufficiently overlaps with the other. If this was intentional, convert the expression to
   'unknown' first." */
```

That check is trivially satisfied when the source is `unknown`, which is precisely the situation
where the least is known. So the assertion is at its weakest exactly where it is most tempting.

Non-null assertions are the same mistake compressed into one character, and
`@typescript-eslint/no-non-null-assertion` rejects them. `assertDefined` and `ensuresDefinedValue`
in [src/lib/typeguards.ts](../../../src/lib/typeguards.ts) do the job with a real check.

## Where an Assertion Is Legitimate

The legitimate cases are **type-level**: positions where the compiler cannot see something a reader
can. None of them involve claiming a shape for runtime data. The bar is that the claim is one the
compiler cannot verify but a reader can, and that a comment says why it holds — which is the
canonical remaining use of an inline comment under the
[code comments rule](../../../.claude/rules/code-quality/code-comments.md).

Inside a generic function the type parameter is unresolved, so a concrete value the body produces
cannot be proven to satisfy it. `parseStringUnitlessSize` in
[src/components/types/sizes.ts](../../../src/components/types/sizes.ts) has a conditional return
type keyed off its options object, and the `null` it produces in the non-strict branch is not
assignable to the unresolved conditional:

```typescript
type ParsedStringUnitlessSize<O extends { strict?: boolean }> = O extends { strict: false }
  ? null | number
  : number;

export const parseStringUnitlessSize = <O extends { strict?: boolean }>(
  value: string,
  opts?: O,
): ParsedStringUnitlessSize<O> => {
  /* ... */
  /* Reaching this return means `strict` was passed as `false`, which resolves the conditional
     return type to `null | number`. `O` is still unresolved here, so the checker cannot make that
     connection on its own. */
  return null as ParsedStringUnitlessSize<O>;
};
```

Returning a bare `null` fails with _"Type 'null' is not assignable to type
`ParsedStringUnitlessSize<O>`"_, because the compiler has to assume `O` might be `{ strict: true }`.
The assertion is sound for one reason: the branch the compiler cannot pick has already been picked
by a check it did run. The same shape appears whenever narrowing a parameter ought to narrow a
conditional return type but does not, and at inference boundaries — inside a generic class body,
where members computed from the type parameter are opaque even though they are exact at every call
site. `HttpClient` in
[src/integrations/http/http-client.ts](../../../src/integrations/http/http-client.ts) carries both.

What separates these from a coercion is that they restate something the surrounding declaration
already guarantees. A comment cannot do the same work for runtime data:

```typescript
// Disallowed: the claim is about data, and only a runtime check can make a claim about data.
/* The GitHub API always returns this shape. */
return data as GithubRepo[];
```

## `as const` and `satisfies`

`as const` shares a keyword with type assertions and nothing else. It is a _const assertion_: it
asserts nothing about a value, it instructs the compiler to infer the narrowest type the literal
supports. It cannot be wrong, and it is what makes the derive-the-union-from-the-array pattern in
[Type Guards & Assertions](./type-guards.md) work:

```typescript
export const SizeUnits = ['%', 'px', 'rem'] as const;

export type SizeUnit = (typeof SizeUnits)[number];
```

`satisfies` validates an expression against a type without widening it and without asserting
anything. Where `as` says "treat this as `T`", `satisfies` says "check that this is a `T`, and leave
its type alone". Wherever both would compile, `satisfies` is the one to use:

```typescript
type FilterValue = readonly string[] | string;

// Disallowed: the assertion widens every value, so `Filters.search` is `FilterValue` and nothing
// downstream knows it is a string.
const Filters = { search: 'react', skills: ['typescript'] } as Record<string, FilterValue>;

// Correct: every value is checked and inference is untouched, so `Filters.search` is still
// `string`.
const Filters = { search: 'react', skills: ['typescript'] } satisfies Record<string, FilterValue>;
```

It also reports mistakes an assertion hides. An assertion on an object literal switches off the
excess-property check; `satisfies` does not:

```typescript
interface RepositoryFilters {
  readonly search: string;
  readonly visible: boolean;
}

// Disallowed: `hidden` was written where the type declares `visible`. The assertion accepts it,
// and `Filters.visible` reads `undefined` at runtime under a type that promises `boolean`.
const Filters = { hidden: false, search: 'react' } as RepositoryFilters;

// Correct: the mistake is now a compile error — "Object literal may only specify known properties,
// and 'hidden' does not exist in type 'RepositoryFilters'."
const Filters = { hidden: false, search: 'react' } satisfies RepositoryFilters;
```

The two combine as `as const satisfies T`, which is the standard form for a lookup table whose
literal values matter. [src/database/fixtures/schemas.ts](../../../src/database/fixtures/schemas.ts)
and `src/actions/types/search.ts` both use it.

## Zod at the Boundaries

A hand-written type guard is proportionate for a small shape — one or two properties, checked in a
single expression, as [src/api/client.ts](../../../src/api/client.ts) does for its response-body
envelopes. Reach for Zod once the shape is nested, has many fields, or crosses a trust boundary,
because a hand-rolled check over a large shape is never total in practice and a type predicate is an
unchecked promise:

```typescript
// Disallowed: one of twelve fields is checked, and only for presence. The predicate promises the
// whole shape anyway.
const isJsonSkill = (value: unknown): value is JsonSkill =>
  typeof value === 'object' && value !== null && 'label' in value;

// Correct: the schema is the check. From `src/database/fixtures/schemas.ts`.
export const SkillJsonSchema = MetaSchema.extend({
  categories: z.array(z.nativeEnum(SkillCategory)).optional(),
  description: NullableStringField({}),
  experience: z.number().int().nonnegative().nullable().optional(),
  label: NonNullableStringField({}),
  visible: z.boolean().optional(),
});
```

`safeParse` returns a discriminated result and is right whenever the failure is something the caller
handles — a bad request body, an invalid filter in a URL. `parse` throws, and is right only where an
invalid value is a defect rather than a runtime condition, such as a fixture that ships with the
repository. The server actions use `safeParse` and surface the Zod error to the form:

```typescript
// Correct: from `src/actions/skills/create-skill.ts`. The failure path is written out and
// type-checked, and the field-level detail reaches the user.
const parsed = SkillSchema.safeParse(data);
if (!parsed.success) {
  return { error: ApiClientFormError.fromZodError({ error: parsed.error }).json };
}

// Disallowed: `parse` in a request handler turns a client's bad input into an unhandled exception
// and a 500, when the caller was perfectly able to handle it.
const body = SkillSchema.parse(await request.json());
```

Never discard the failure either. `safeParse(value).success` as a bare boolean is right inside a
type guard, where the boolean _is_ the answer; anywhere else `parsed.error` carries detail the user
or the log needs.

The TypeScript type is derived from the schema with `z.infer` rather than declared beside it. This
is the same principle as declaring the array and deriving the union in
[Type Guards & Assertions](./type-guards.md): the runtime artifact is the definition, and the type
is computed from it, so a new field cannot exist in one place and not the other.

```typescript
// Correct: one declaration. Adding a field to the schema adds it to the type.
export const DetailJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  label: NonNullableStringField({}),
  nestedDetails: z.array(NestedDetailJsonSchema).optional(),
});

export type JsonDetail = z.infer<typeof DetailJsonSchema>;
```

```typescript
// Disallowed: two declarations that must be kept in step, with nothing that notices when they
// diverge. Adding `nestedDetails` to the schema leaves it missing from the type; adding it to the
// type leaves it unvalidated. Neither mistake is a compile error.
export interface JsonDetail {
  readonly description?: null | string;
  readonly label: string;
}

export const DetailJsonSchema = MetaSchema.extend({
  description: NullableStringField({}).optional(),
  label: NonNullableStringField({}),
});
```

## HTTP Responses

`Response.json()` is declared `json(): Promise<any>` in `lib.dom.d.ts`. Every `await res.json()`
therefore produces an `any` at the boundary where the least is known about the value, and the
annotation written next to it decides whether that `any` is contained or set loose:

```typescript
// Disallowed: `user` is an `any` wearing a `User` annotation. This at least still reports "Unsafe
// assignment of an `any` value."
const user: User = await res.json();

// Disallowed, and worse: the assertion makes the expression's type `User`, so the linter has
// nothing left to report and the only signal that nothing was validated is gone.
const user = (await res.json()) as User;
```

The required shape annotates the awaited result `unknown` first — an assignment
`no-unsafe-assignment` explicitly permits, because `unknown` allows no operations until it is
narrowed — and validates before touching a property:

```typescript
const body: unknown = await res.json();

const parsed = UserSchema.safeParse(body);
if (!parsed.success) {
  return { error: new HttpSerializationError({ method: 'GET', status: res.status, url }) };
}
return parsed.data;
```

Two things about `fetch` that the types do not express matter here. A non-2xx response still
resolves, so `res.ok` is checked before the body is read; and a non-2xx body is an error payload
rather than the success shape, so validating it against the success schema reports the wrong
problem. `Response.json()` also rejects with a `SyntaxError` whenever the body is not JSON — a proxy
error page, a framework 404, a redirect to sign-in — so the call belongs in a `try`.
[src/api/client.ts](../../../src/api/client.ts) implements exactly this: status first, then a
guarded parse, then a guard on the parsed body.

```typescript
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
```

## What the Linter Can and Cannot Catch

Seven rules in `tooling/eslint-config-web/configs/typescript.mjs` are configured as errors and form
one perimeter rather than seven opinions. `@typescript-eslint/no-explicit-any` stops the type from
being written; `no-unsafe-assignment`, `no-unsafe-argument`, `no-unsafe-member-access`,
`no-unsafe-call` and `no-unsafe-return` stop an `any` that arrived from a third-party declaration
from being stored, passed, read from, called or returned; `no-non-null-assertion` covers `value!`.

None of them reports a plain `as`. To the linter an assertion is a well-typed expression, so nothing
in the toolchain will ever tell you that a coercion is wrong. That is the whole reason this is
written down as a convention rather than left to tooling.

## Reference

TypeScript's handbook covers
[type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
and
[working with constrained values](https://www.typescriptlang.org/docs/handbook/2/functions.html#working-with-constrained-values);
the release notes cover the
[`unknown` top type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type)
and
[the `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator).
Zod's [parsing and inference](https://zod.dev/basics) documentation covers `parse`, `safeParse` and
`z.infer`.

The prescriptive counterpart of these conventions lives in
`.claude/rules/code-quality/typescript/type-coercion.md` and
`.github/instructions/code-quality/typescript/type-coercion.instructions.md`.
