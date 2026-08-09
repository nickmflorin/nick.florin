---
applyTo: '**/*.tsx'
description:
  'Defining React components: FC-typed const arrow functions, interface props named after the
  component, and inline annotations for generic components'
---

<!-- Parity: keep in sync with .claude/rules/code-quality/react/component-definitions.md -->

# React Component Definitions

## Scope

This file governs the shape of a component's declaration — how the props type is declared and named,
and how the component itself is typed. What belongs _in_ those props (booleans, variants, render
props) is the composition rule in this same directory.

## Props Are an `interface` Named `{Component}Props` — HIGH

A component's props are declared as an exported `interface`, named after the component with a
`Props` suffix. A component named `MyComponent` takes `MyComponentProps` — never a bare `Props`, an
abbreviation, or a name that does not match the component's:

```tsx
// Correct: from `src/components/animations/AnimateChangeInHeight.tsx` — the interface carries the
// component's exact name plus `Props`, and extends the shared `ComponentProps` base.
export interface AnimateChangeInHeightProps extends ComponentProps {
  readonly children: ReactNode;
}
```

The suffix convention matters because props types travel: a wrapping component imports and extends
the props of the component it wraps, and `{Component}Props` makes that import predictable without
opening the file.

An `interface` is favored over a `type` alias because interfaces behave better under extension. An
incompatible override on an `extends` clause is a compile-time error at the declaration; the
intersection a `type` alias forces instead silently merges the two property types:

```tsx
type BaseProps = {
  readonly propA: string;
};

// Disallowed: `propA` is silently `string & number` — an impossible type that surfaces as a
// confusing error at the call site rather than at the declaration.
type ExtendedProps = {
  readonly propA: number;
} & BaseProps;
```

Composed shapes do not require a `type` alias either — an `interface` can extend the result of a
type operator:

```tsx
// Correct: the exclusion is expressed on the `extends` clause, keeping the declaration an
// interface.
export interface RepositoryLinkProps extends Omit<LinkProps<'link'>, 'children' | 'href'> {
  readonly repository: Pick<BrandRepository, 'slug'>;
}
```

## Components Are `FC`-Typed `const` Arrow Functions — HIGH

A component is declared as a `const` arrow function annotated with `FC` from `react`, parameterized
by its props interface. The annotation sits on the constant, not on the parameter:

```tsx
import { type FC } from 'react';

// Correct: the constant is typed as the component, `FC` binds it to its props interface, and the
// parameter destructures freely.
export const SeriesLegend: FC<SeriesLegendProps> = ({ series, className }) => (
  <div className={className}>
    {series.map(entry => (
      <SeriesLegendItem key={entry.id} entry={entry} />
    ))}
  </div>
);
```

`react/function-component-definition` already makes a `function` declaration an ESLint error; this
rule additionally fixes where the type annotation lives:

```tsx
// Disallowed: the annotation sits on the parameter and the return type is unstated — nothing in
// the declaration itself types `State` as a component.
export const State = ({ children }: StateProps) => <Loading>{children}</Loading>;

// Disallowed: `function` declarations are an ESLint error via
// `react/function-component-definition`.
export function State({ children }: StateProps) {
  return <Loading>{children}</Loading>;
}
```

## Generic Components Inline the Props Annotation — HIGH

`FC` cannot express a component with generic type arguments: `FC<DataTableProps<T>>` requires a `T`
already in scope, and a `const` annotation has no way to declare one. A generic component therefore
declares the type parameter on the arrow function itself, annotates its props parameter inline, and
states its return type explicitly:

```tsx
import { type JSX } from 'react';

export interface DataTableProps<T> {
  readonly rows: readonly T[];
  readonly onRowClick?: (row: T) => void;
}

// Correct: the type parameter lives on the arrow function, so the props annotation moves inline —
// `FC` has nowhere to bind `T`. The trailing comma in `<T,>` keeps the parser from reading the
// type parameter as a JSX tag in a `.tsx` file.
export const DataTable = <T,>({ rows, onRowClick }: DataTableProps<T>): JSX.Element => (
  <Table>
    {rows.map((row, i) => (
      <DataTableRow key={i} row={row} onClick={() => onRowClick?.(row)} />
    ))}
  </Table>
);
```

The inline annotation is reserved for this case. A component without generic type arguments never
uses it — an inline props annotation should itself signal "this component is generic".

## Applying the Convention

These rules govern new components and deliberate rewrites. Much of the codebase predates the `FC`
form — existing components annotate the parameter directly — so do not sweep the repository
converting them as a side effect of unrelated work. When a component is already being rewritten, or
its props are being restructured, bring its declaration into conformance as part of that change.
