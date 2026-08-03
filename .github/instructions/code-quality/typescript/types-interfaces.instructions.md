---
applyTo: '**/*.{ts,tsx}'
description: 'Conventions for declaring types and interfaces'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/typescript/types-interfaces.md -->

# Types & Interfaces

## Readonly Properties

### The Default: `readonly` on Every Property

Every property declared on a type or interface starts with the `readonly` modifier:

```typescript
interface ProfileCardProps {
  readonly name: string;
  readonly photoUrl?: string;
  readonly onSelect?: (id: string) => void;
}
```

This applies to every object type declaration — props interfaces, model types, options objects, and
any other named type whose shape is declared with properties. Generated code must always include the
modifier on every property it declares.

### What the Rule Governs

The rule governs the property modifier only — the key, not the value. A property's value type is not
required to be immutable: an array-typed property does not need to be `readonly string[]`, and an
object-typed property does not need `Readonly<...>`. Whether a value type is itself readonly is a
separate, case-by-case decision made on the merits of the value.

```typescript
interface ChartProps {
  // Correct: the property is readonly; the array value type may remain mutable.
  readonly series: number[];
}
```

### Omitting `readonly`

Omitting the modifier is the rare exception, justified only when assignment to that property after
construction is genuinely required — for example an accumulator or builder object whose properties
are written in place. When a type must permit mutation, omit `readonly` only on the specific
properties that are actually assigned, never across the whole type.

The same bar applies in reverse: never remove an existing `readonly` modifier just to make code
compile or to silence a type error. Removing one is justified only when mutating that property is
genuinely critical to the design; otherwise restructure the code that wants to mutate (copy with
spread, build the object in one expression, or use a deliberately mutable local type).

### Applying the Convention

These rules govern new declarations and deliberate restructures. Parts of the codebase predate the
convention; do not mass-edit existing types as a side effect of unrelated work. When a type is
already being edited, bring its properties into conformance as part of that change.
