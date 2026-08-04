# React Composition

Conventions for designing component APIs that stay workable as they grow.

## Booleans Describe State, Not Identity

A boolean prop that describes a state the same component can be in is correct and expected:

```tsx
interface ButtonProps {
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
}
```

A boolean that selects _which component this really is_ is a different thing wearing the same
syntax. Each one doubles the notional state space, and the body accumulates conditionals that no
single caller exercises:

```tsx
// Disallowed: six booleans is sixty-four notional states, of which perhaps four are real. Nothing
// in the type prevents an illegal combination.
interface ComposerProps {
  readonly isThread?: boolean;
  readonly isDMThread?: boolean;
  readonly isEditing?: boolean;
  readonly isForwarding?: boolean;
  readonly channelId?: string;
  readonly dmId?: string;
}
```

The test is whether the flag changes _what renders_ or _how the same thing behaves_. Structurally
different trees mean two components.

Worth noting because the two are easy to conflate: `react/boolean-prop-naming` requires an
`is`/`has`/`can`/`will`/`should` prefix on boolean props. That rule governs how one is **named**;
this convention governs whether it should exist. Passing the linter is not evidence the prop is
justified.

## Write the Variants Out

When a flag selects a variant, name the variants. Each one is explicit about what it renders, and
the internals stay shared:

```tsx
// Disallowed: the caller passes flags and the component works out what it is.
<Composer isThread channelId={channelId} />

// Correct: the caller names what it wants.
<ThreadComposer channelId={channelId} />
```

```tsx
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

A closed set of variants that genuinely shares one tree is a single discriminated `variant` prop
rather than several booleans — and it then falls under
[Exhaustive Type Checking](../typescript/exhaustiveness.md), so every variant must be handled
explicitly.

## Children Over Render Props

A `renderX` prop whose only job is to return markup is a slot. Express it as `children` or as a
`ReactNode`-typed prop so the caller composes normally:

```tsx
// Disallowed: a callback that takes no arguments and returns markup.
<DataTable renderHeader={() => <SkillsTableHeader />} />

// Correct.
<DataTable header={<SkillsTableHeader />} />
```

A render prop earns its keep only when the callback receives something the caller could not
otherwise obtain — a row, an index, an internal state value.

## Lift State Into a Provider

When siblings need the same state, it moves into a provider rather than into a prop threaded through
a common ancestor that does not use it. The provider becomes the only module that knows how the
state is stored, so changing that — `useState` to a reducer, a store, or a URL parameter — touches
one file:

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

The context is exposed through a hook that throws outside its provider rather than returning
`undefined` for every consumer to handle — which makes it an assertion, subject to
[Type Guards & Assertions](../typescript/type-guards.md).

## React 19

`forwardRef` is obsolete (`ref` is an ordinary prop), `use()` replaces `useContext()`, and `Context`
renders directly rather than through `Context.Provider`. All three are already ESLint errors via
`@eslint-react`, so they need no attention in review.

## Reference

The fuller treatment — compound components, context interfaces, dependency injection through
providers — is Vercel Engineering's composition-patterns guide, installed at
[.claude/skills/vercel-composition-patterns/](../../../.claude/skills/vercel-composition-patterns/)
and consulted on demand when designing a new reusable component API.

The prescriptive counterpart of this document lives in
`.claude/rules/code-quality/react/composition.md` and
`.github/instructions/code-quality/react/composition.instructions.md`.
