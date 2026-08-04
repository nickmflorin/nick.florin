---
paths:
  - '**/*.tsx'
description:
  'Composing React components: boolean prop proliferation, explicit variants, compound components,
  and children over render props'
---

<!-- Parity: keep in sync with .github/instructions/code-quality/react/composition.instructions.md -->

# React Composition

## Scope

This file carries the composition rules that apply to this codebase. The fuller treatment — compound
components, context interfaces, dependency injection through providers — is installed as the
`vercel-composition-patterns` skill. Invoke it when designing a new reusable component API or
refactoring one that has outgrown its props; the rules below apply without being asked.

## Boolean Props Select State, Never Variants — HIGH

A boolean prop that describes the component's **state** is correct and expected:

```tsx
// Correct: each describes a state the same component can be in.
interface ButtonProps {
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
}
```

A boolean prop that selects **which component this really is** is not. Each one doubles the state
space, and the body fills with conditionals that no single caller exercises:

```tsx
// Disallowed: six booleans is sixty-four notional states, of which four are real. Every reader has
// to work out which combinations are legal, and nothing in the type stops an illegal one.
interface ComposerProps {
  readonly isThread?: boolean;
  readonly isDMThread?: boolean;
  readonly isEditing?: boolean;
  readonly isForwarding?: boolean;
  readonly channelId?: string;
  readonly dmId?: string;
}
```

The test is whether the flag changes _what renders_ or _how the same thing behaves_. If two values
of the flag produce structurally different trees, they are two components.

Note the interaction with `react/boolean-prop-naming`, which requires an `is`/`has`/`can`/`will`/
`should` prefix. That rule governs how a boolean prop is **named**; this one governs whether it
should exist at all. Satisfying the linter is not evidence the prop is justified.

## Prefer Explicit Variant Components — HIGH

When a flag selects a variant, write the variants out. Each one names what it renders, and the
shared internals stay shared:

```tsx
// Disallowed: the caller passes flags and the component decides what it is.
<Composer isThread channelId={channelId} />

// Correct: the caller names what it wants, and the component has nothing to decide.
<ThreadComposer channelId={channelId} />
```

```tsx
// Correct: variants compose the same internals without a shared monolithic parent.
const ChannelComposer = (): JSX.Element => (
  <Composer.Frame>
    <Composer.Header />
    <Composer.Input />
    <Composer.Footer>
      <Composer.Attachments />
      <Composer.Submit />
    </Composer.Footer>
  </Composer.Frame>
);

const EditComposer = (): JSX.Element => (
  <Composer.Frame>
    <Composer.Input />
    <Composer.Footer>
      <Composer.CancelEdit />
      <Composer.SaveEdit />
    </Composer.Footer>
  </Composer.Frame>
);
```

A closed set of variants that genuinely share one tree is a discriminated `variant` prop rather than
several booleans — and it is then subject to the exhaustiveness rule in the `typescript/`
subdirectory of this same `code-quality/` directory, so every variant must be handled explicitly.

```tsx
// Correct: one axis, a finite set of values, exhaustively handled.
interface BadgeProps {
  readonly variant: 'success' | 'warning' | 'error';
}
```

## Children Over Render Props — MEDIUM

A `renderX` prop that exists only to inject markup is a slot. Express it as `children`, or as a
`ReactNode`-typed prop, so the caller composes normally:

```tsx
// Disallowed: a callback whose only job is to return markup.
<DataTable renderHeader={() => <SkillsTableHeader />} />

// Correct.
<DataTable header={<SkillsTableHeader />} />
```

A render prop is justified only when the callback receives arguments the caller could not otherwise
obtain — a row, an index, an internal state value. If it takes no arguments, it is a slot.

## Lift State Into a Provider — MEDIUM

When siblings need the same state, it moves into a provider rather than into a prop threaded through
a common ancestor. The provider becomes the only module that knows how the state is stored, so
swapping the implementation — `useState` to a reducer, a store, or a URL parameter — touches one
file.

```tsx
// Disallowed: the parent holds state it does not use, purely to pass it down twice.
const Layout = (): JSX.Element => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <SkillsList selected={selected} onSelect={setSelected} />
      <SkillsDetail selected={selected} />
    </>
  );
};

// Correct: the provider owns the state and both consumers read it directly.
const Layout = (): JSX.Element => (
  <SelectedSkillProvider>
    <SkillsList />
    <SkillsDetail />
  </SelectedSkillProvider>
);
```

Expose the context through a hook that throws when used outside its provider, rather than returning
`undefined` for every consumer to handle. That is an assertion, so it follows the assertion-function
conventions in the `typescript/` subdirectory.

## React 19

`forwardRef` is obsolete — `ref` is an ordinary prop. `use()` replaces `useContext()`, and `Context`
is rendered directly rather than `Context.Provider`. All three are already errors in
`tooling/eslint-config-web/configs/react.mjs` (`@eslint-react/no-forward-ref`,
`@eslint-react/no-use-context`, `@eslint-react/no-context-provider`), so they need no restating in
review.

## Applying the Convention

These rules govern new components and deliberate restructures. Parts of the codebase predate them;
do not sweep the repository converting existing components as a side effect of unrelated work. When
a component's props are already being added to, or the component is being rewritten, bring it into
conformance as part of that change — and treat a third boolean prop arriving on an existing
component as the signal to split it rather than extend it.

For designing a new reusable component API from scratch, invoke the `vercel-composition-patterns`
skill.
