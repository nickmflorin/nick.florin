# Types & Interfaces

Conventions for declaring object shapes — types and interfaces — in this repository.

## Readonly Properties

Every property declared on a type or interface starts with the `readonly` modifier
(`readonly name: string`). This applies to props interfaces, model types, options objects, and any
other declared object shape. Omitting the modifier is the rare exception, justified only when
assignment to that specific property after construction is genuinely required (an accumulator or
builder object, for example) — and an existing `readonly` is never removed merely to make code
compile.

The convention governs the property key, not the value: an array-typed property does not need a
`readonly string[]` value type, and an object-typed property does not need `Readonly<...>`. Whether
a value type is itself immutable is a separate, case-by-case decision.

```ts
interface ChartProps {
  // The property is readonly; the array value type may remain mutable.
  readonly series: number[];
  readonly onSelect?: (index: number) => void;
}
```

The convention governs new declarations and deliberate restructures. Parts of the codebase predate
it; existing types are not mass-edited, but a type that is already being edited is brought into
conformance as part of that change.
