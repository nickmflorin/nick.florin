# React Component Definitions

Conventions for the shape of a component's declaration: how the props type is declared and named,
and how the component itself is typed. What belongs _inside_ those props — booleans, variants,
render props — is covered by [Composition](./composition.md).

## The Canonical Shape

A component is a `const` arrow function annotated with `FC` from `react`, taking an exported
`interface` named after the component with a `Props` suffix:

```tsx
import { type FC, type ReactNode } from 'react';

import { type ComponentProps } from '~/components/types';

export interface AnimateChangeInHeightProps extends ComponentProps {
  readonly children: ReactNode;
}

export const AnimateChangeInHeight: FC<AnimateChangeInHeightProps> = ({ children, className }) => {
  /* ... */
};
```

The annotation sits on the constant rather than on the parameter, so the declaration itself is typed
as a component — the props binding and the return type both come from `FC` — and the parameter is
free to destructure. Arrow functions (rather than `function` declarations) are enforced by
`react/function-component-definition`.

## Interfaces Over Type Aliases

Props are declared with `interface` rather than `type` because interfaces are more amenable to
extension. When an `interface` extends another and overrides a property, an incompatible override is
a compile-time error at the declaration. The intersection a `type` alias forces produces a silent
merge of the two property types instead:

```tsx
type BaseProps = {
  readonly propA: string;
};

// This results in { readonly propA: string & number } — an impossible type — with no error at the
// declaration.
type ExtendedProps = {
  readonly propA: number;
} & BaseProps;
```

Shapes built from type operators do not force a `type` alias; an `interface` can extend the result
directly:

```tsx
export interface RepositoryLinkProps extends Omit<LinkProps<'link'>, 'children' | 'href'> {
  readonly repository: Pick<BrandRepository, 'slug'>;
}
```

## Props Are Named After the Component

The props interface for `MyComponent` is always `MyComponentProps` — never a bare `Props`, an
abbreviation, or an unrelated name. Props types travel: a component that wraps another usually
imports and extends the wrapped component's props, and the `{Component}Props` convention makes that
import predictable without opening the file. It also keeps the props exportable from the same file
as the component without name collisions across the codebase.

## Generic Components

`FC` cannot express a component with generic type arguments. Writing `FC<DataTableProps<T>>`
requires a `T` that is already in scope, and a `const` annotation offers no place to declare one. A
generic component therefore declares its type parameter on the arrow function itself, annotates the
props parameter inline, and states its return type explicitly:

```tsx
import { type JSX } from 'react';

export interface DataTableProps<T> {
  readonly rows: readonly T[];
  readonly onRowClick?: (row: T) => void;
}

export const DataTable = <T,>({ rows, onRowClick }: DataTableProps<T>): JSX.Element => {
  /* ... */
};
```

The trailing comma in `<T,>` is required in `.tsx` files, where a bare `<T>` would be parsed as an
opening JSX tag. The inline props annotation is reserved for this case — on a non-generic component
it would only obscure that the declaration is a component — so encountering one is itself a signal
that the component is generic.

## Reference

The prescriptive counterpart of this document lives in
`.claude/rules/code-quality/react/component-definitions.md` and
`.github/instructions/code-quality/react/component-definitions.instructions.md`.
