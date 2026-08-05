# Best Practices

This document outlines best practices and code patterns that this repository adheres to, as it
relates to code quality, code cleanliness, and code integrity of the codebase.

> Clean, organized code that follows best practices is a requirement, not a "nice to have".

## Table of Contents

- [General Practices](#general-practices)
  - [Commenting Code](#commenting-code)
  - [Linting & Formatting](#linting--formatting)
  - [Spelling](#spelling)
- [Frontend Development](#frontend-development)
  - [React Component Design](#react-component-design)
  - [Props & State Conventions](#props--state-conventions)
  - [Third-Party Components](#third-party-components)
- [Code Organization](#code-organization)
  - [File & Folder Naming](#file--folder-naming)

---

## General Practices

### Commenting Code

As with other forms of documentation, comments should be thorough and formally written such that
other developers can clearly understand its intent. When writing comments, or documenting APIs via
JSDoc, the following rules should apply:

1. Comments should be written in formal english, with appropriate punctuation and grammar. They
   should not represent a collection of random, disconnected thoughts - but rather a cohesive,
   well-structured explanation of the code.
2. Comments should be thorough and easy for other developers to understand.
3. Comments should be written in a way that makes them easy to maintain.
4. Comments should describe the current state of the code, not its history. Avoid comparative or
   temporal references that go stale, such as calling something "a flatter version of the previous
   config" once that config no longer exists; state what the code is now.
5. Comments should explain why the code is the way it is when that is not obvious, rather than
   narrating the approach used to write it, and should avoid redundant or over-wordy explanations.

#### Comment Styles

There are two different types of comments:

**1. Implementation Comments (Block/Line Comments)**

Comments that are used to add context to a certain line or block of code. These comments should be
used to document specific sections of code inside of a function, class or component. These comments
should be used to document context that would not otherwise be obvious to a developer. In other
words, they should be used to explain "why" the code is doing something, not "what" the code is
doing.

```ts
export const getRedirectUrl = (req: NextRequest, hasCmsAccess: boolean) => {
  if (!hasCmsAccess) {
    /* Redirecting back to the dashboard can cause issues with the 'useNavigationItem' hook and
       loading indicators on the navigation button, because if the navigation button is clicked
       while on the dashboard, and we redirect to the dashboard, this redirect will happen server
       side, and the page change will not be detected by the hook and the navigation button will
       show a loading indicator indefinitely. */
    return new URL('/404', req.url);
  }
  return null;
};
```

**2. API Documentation (JSDoc Comments)**

Comments that are used to describe an API, such as the function, class, property or component
itself. These comments should describe "what" the code is doing, and sometimes - "why" it is doing
it as well.

```ts
/**
 * Parses the query parameters from the provided URL and returns the query parameters as an object.
 *
 * @param {string} url The URL that the query parameters should be parsed from.
 *
 * @returns {Record<string, string>}
 *   An object that represents the parameter names and values that are in the URL.
 */
export const getQueryParams = (url: string): ParsedUrlQuery => ({});
```

When possible, and appropriate, it is important to extract logic, variables, properties or other
information into it's own self-documenting construct. For example, if there is a need to transform a
string inside of a particular function, extract that requirement into a helper function with a name
that is self-documenting that can be documented via JSDoc.

The blocks in [`src/integrations/http/query.ts`](../../src/integrations/http/query.ts) follow the
enforced JSDoc format exactly and can be used as a reference.

#### Writing JSDoc

JSDoc exists to document an API. Because of this, the way a JSDoc block is written matters just as
much as the fact that it exists:

1. **Lead with the API description.** The block should always open by describing what the construct
   is and what it does. Only after that initial description should it layer in business context,
   rationale, edge cases or other supporting detail. A reader should understand the "what" from the
   first sentence before being asked to absorb the "why". Visually separate that opening description
   from the business context that follows with a blank line.
2. **Write it as prose.** A JSDoc block should read as a cohesive, well-structured explanation
   written in formal English. It should not read as a scattered collection of thoughts or a bare
   list of disconnected statements.
3. **Separate distinct ideas into paragraphs.** When a block covers more than one concern (what the
   construct is, why it exists, how it is used), give each its own short paragraph separated by a
   blank line (a bare `*` line), rather than running them together into one dense block.
4. **Reserve it for declarations.** JSDoc annotates a declaration such as a function, class, method,
   type, or constant. A JSDoc block placed on a statement inside a function body is an inline
   comment regardless of its `/** */` syntax; the syntax does not reclassify it as API
   documentation. The fix is not to demote it to a regular comment, but to extract the logic into a
   named constant or function that can be formally documented, or to give it a self-documenting name
   that needs no comment at all.
5. **Link concrete symbols.** Reference a function, class, constant, or type with `{@link Symbol}`
   rather than backticks wherever a real symbol can be linked. Reserve backticks for literals,
   shapes, or external names with no symbol to link.
6. **Document members at the member.** When a construct has members (an interface, type, class, or
   enum), document each one with its own JSDoc block directly above it, not with `@property` tags or
   a bulleted list on the root block. Per-member JSDoc is what IntelliSense surfaces at each
   member's use site.
7. **Always write the block as multiple lines.** A JSDoc block spans at least three lines: `/**` on
   its own line, each description line prefixed with an aligned `*`, and `*/` on its own line.
   Single-line blocks (`/** The user's name. */`) are not allowed, no matter how short the
   description is; the linter enforces and auto-fixes this (`jsdoc/multiline-blocks`). The one
   exception is an inline `/** @type {T} */` cast, which stays on one line.
8. **Skip file-level headers by default.** A file- or module-level JSDoc block is justified only
   when the file carries necessary context that is not obvious from reading its contents and that
   applies to the file as a whole. Context that belongs to one declaration is documented on that
   declaration, never hoisted to the top of the file.

For example, a constant whose documentation spans several concerns leads with what it is, then gives
each concern its own paragraph. The opening paragraph defines what the value represents; the
business context (when it applies and how it is used) follows afterwards:

```ts
/**
 * Defines the error message that is shown when attempting to save an {@link Experience} whose
 * start date falls after its end date.
 *
 * This message represents the only date-related error that would be expected and user-facing, as
 * all other validation errors in the {@link ExperienceSchema} should be prevented by the form and
 * UI mechanics.
 *
 * This constant is used to key off of in the form's submit handler in order to issue logs if
 * in fact the schema validation resulted in a submit-blocking error that was not expected.
 */
export const InvalidDateRangeErrorMessage = 'The start date must come before the end date.';
```

Documenting the same constant the wrong way opens with how it is used and never states what the
value actually represents, which forces the reader to infer the "what" from the "how":

```ts
/**
 * This constant is used to key off of in the form's submit handler in order to issue logs if
 * in fact the schema validation resulted in a submit-blocking error that was not expected.
 */
export const InvalidDateRangeErrorMessage = 'The start date must come before the end date.';
```

#### Documenting Components and Props

React components and their props types are not documented by default, and documenting every
component mechanically is exactly the wrong instinct. A JSDoc block that only restates what a
component renders, or that says a props type holds "the props for `X`", adds nothing and should be
left off.

A UI component earns documentation only when it is explicitly requested, or when the component
carries business context or abstract concepts that the code alone does not convey: contextual
information necessary to understand its purpose, or an explanation of behavior that is non-obvious
or non-standard. If everything the block would say is already apparent from reading the component's
code, leave the block off.
[`DynamicLoading`](../../src/components/loading/dynamic-loading/dynamic-loading.tsx) is an example
of a component that clears that bar.

The documentation that does pay off lives above an individual prop, in two cases: a prop whose
purpose or usage is not obvious from its name and type, and a prop whose default value is applied
implicitly inside the component. Record an implicit default with the `@default` tag:

```tsx
interface ProgressBarProps {
  /**
   * Whether the bar animates as its value changes.
   *
   * @default true
   */
  readonly isAnimated?: boolean;
}
```

A prop whose meaning is clear from its name and type needs no JSDoc.

#### Inline Comments Are a Last Resort

Inline comments (block or line comments inside the body of a piece of code) should be treated as a
last resort, reached for only when there is genuinely no better option.

The reason is simple: an inline comment should never describe **what** the code is doing. If a
developer can understand the behavior by reading the code itself, the comment adds nothing and
should be removed. The only thing an inline comment can legitimately add is an explanation of
**why** something non-obvious is being done.

Even then, extraction is almost always the better answer. Before writing an inline comment, ask
whether the logic can be lifted into a well-named function, constant or type and documented with
JSDoc instead. If it can, do that. The earlier redirect example is illustrative: the explanation of
why an unauthorized user is sent to the 404 page lives better as JSDoc on an extracted, well-named
helper than as a block comment buried in a conditional.

The canonical case where an inline comment genuinely earns its place is justifying why a type
coercion is safe. A coercion is an expression, not a declaration, so it cannot always be abstracted
into a separately documented variable or function. Explaining why the coercion is sound is exactly
the kind of non-obvious "why" that an inline comment is meant to capture.

Multi-line block comments use the `bare-block` style enforced by
`@stylistic/multiline-comment-style` (no aligned `*` prefix on each line), and a comment must never
share a line with code (`no-inline-comments`, `@stylistic/line-comment-position`).

The delimiters of a bare-block comment hug the text, as the earlier redirect example shows: the
text starts on the same line as the `/*` opener, continuation lines are indented three spaces to
align with it, and the closing `*/` ends the last line of text rather than sitting on its own line.
The closer only drops to its own line when appending ` */` would push the last line past the
100-character limit. ESLint does not police delimiter placement, so this is applied while writing
the comment:

```typescript
/* Correct: the text opens beside the opening delimiter, the continuation line aligns with it, and
   the closing delimiter ends the final line of text. */

/*
Disallowed: both delimiters occupy lines of their own even though the text fits beside the opener
and the closer fits at the end of the line above.
*/
```

This shape is the opposite of a JSDoc block, where `/**` and `*/` each keep their own line and text
never shares a line with either delimiter.

#### Extracting to Document Instead of Commenting

When a value or piece of logic can be named and documented, extracting it is required rather than
optional. A trivial value or a one-line function, once extracted, carries a JSDoc block that travels
with every use of it, which is far more durable than a comment buried inside a larger function. This
holds even when the extracted thing looks too small to bother with, precisely because the value is
trivial but the reason for it is not.

The key move is to lift the value out of the code body. While it is embedded inline, the only place
to explain it is an inline comment, which is disallowed when the value could instead be a documented
declaration. Once it is a named declaration, the explanation lives in JSDoc that travels with every
use. Compare a value left inline in the markup against the same value extracted and documented:

```tsx
// Disallowed: the value is inline and can only be explained with an inline comment.
const TabBar = ({ children }: TabBarProps) => (
  // The bar sits two pixels low so its bottom border overlaps the panel border beneath it.
  <div className='relative top-[2px]'>{children}</div>
);

// Required instead: the value is named and the reason lives in JSDoc on the declaration.
/**
 * The offset applied to the tab bar so that its bottom border overlaps the top border of the
 * panel rendered beneath it, rather than sitting above it.
 */
const TabBarBorderOverlapOffset = 'top-[2px]';

const TabBar = ({ children }: TabBarProps) => (
  <div className={classNames('relative', TabBarBorderOverlapOffset)}>{children}</div>
);
```

The same applies to trivial functions. A one-line helper can be extracted purely so its JSDoc can
record a non-obvious business reason. The function body is trivial; the value of extracting it is
that the rationale now lives in a documented construct instead of an inline comment.

#### TODO Comments Are Forbidden

`TODO`, `FIXME`, `XXX` and other deferral-style comments must never be added to the codebase, and
are rejected by the `no-warning-comments` ESLint rule. Outstanding work belongs in the issue
tracker, not as a comment that silently rots in the source.

#### ESLint Disable Comments

Disabling an ESLint rule is a true last resort, used only when there is literally no other option. A
rule should never be disabled simply to silence it. A disable is justified only when the rule is
falsely reporting the violation (a genuine false positive), or when there is no other way to write
the code that would avoid violating the rule due to a technical or business-logic constraint. If the
violation can be resolved by writing the code differently, do that instead of disabling the rule.

Beyond _whether_ a rule may be disabled, _which_ rules may be disabled at all is governed by a fixed
catalog. Every rule is `Never` by default; only the rules named in the catalog may ever be disabled,
and each is classified as either **Limited** (disable-able in test or non-test files when absolutely
necessary) or **Limited (test only)** (disable-able only in test files). Auto-fixable formatting
rules are always `Never`, with the lone exception of `import/order`, and
`@typescript-eslint/no-explicit-any` is `Never` except where `any` is genuinely required for type
inference over function signatures. `no-console` is `Limited` but disabled more liberally than other
`Limited` rules, since a structured logger cannot always be used (bootstrap, environment, build, and
CLI contexts). The authoritative catalog lives with the agent rules in
[`.github/instructions/code-quality/eslint.instructions.md`](../../.github/instructions/code-quality/eslint.instructions.md)
(and [`.claude/rules/code-quality/eslint.md`](../../.claude/rules/code-quality/eslint.md)); consult
it before disabling any rule. Some `Never` rules are absolute:
`@typescript-eslint/ban-tslint-comment`, for instance, must never be disabled under any
circumstances, in any file.

When a disable is genuinely warranted, it must be tightly scoped and justified so that a reviewer
can immediately understand why the rule is being silenced:

1. **Scope the disable.** Prefer `eslint-disable-next-line <rule>` to silence a single line. When a
   whole block must be exempted, open it with `eslint-disable <rule>` and close it with a matching
   `eslint-enable <rule>` shortly after. Never leave a block-level disable open across unrelated
   code, and never disable all rules at once.
2. **Explain why.** Every disable directive should carry an explanation after a `--` separator,
   written in the `/* ... */` block form used across the codebase:

   ```ts
   /* eslint-disable-next-line no-console -- The logger is not in context for seeding. */
   ```

3. **The exceptions.** The `camelcase` rule (routinely disabled around external `snake_case` API
   payloads) and the `max-lines` rule are exempt from the explanation requirement and may be
   disabled without an accompanying explanation.

#### Line Length

Comments and JSDoc are subject to the same `@stylistic/max-len` limit of 100 characters as the rest
of the code, and must never exceed it. Each line should be packed as close to 100 characters as
possible before wrapping rather than being broken early. This is mechanical formatting: it should be
applied automatically whenever comments or documentation are added or edited, and reconciled again
as part of preparing a pull request.

### Linting & Formatting

This project uses both ESLint and Prettier to both format and lint the repository. The choice of
which tool is used to format and lint a given file in the codebase is determined by the file's
extension. When ESLint is used to format and lint the file, Prettier is still used for formatting,
but it is used via ESLint with the
<a href='https://github.com/prettier/eslint-plugin-prettier'>`eslint-plugin-prettier`</a> package.

The ESLint configuration lives in [`tooling/eslint-config-web/`](../../tooling/eslint-config-web),
with the individual rule sets split across `configs/*.mjs`, and the Prettier configuration lives in
[`.prettierrc.yaml`](../../.prettierrc.yaml). Together they serve as the definitive style-guide for
the codebase, and should be relied upon as the ultimate source of truth.

The configurations for both of these tools are intentionally strict, and have the following
intentions:

1. **Reducing Ambiguity**: Reducing ambiguity in the codebase as much as possible, so developers can
   spend more time building features and less time debating how many blank lines should exist
   between two lines of code in a Pull Request.
2. **Higher Degrees of Consistency**: Ensuring the highest degree of consistency between the
   formatted code amongst different developers. This helps keep the codebase consistent, predictable
   and readable.
3. **Reducing Bugs**: Reducing the likelihood of bugs through improved code quality and type-based
   linting rules as much as possible.

> Configurations for both ESLint and Prettier should be maintained and improved upon as requirements
> change and new tools are introduced.

#### Philosophy

The general philosophy in regard to linting and formatting - which is exemplified by the strictness
of the configurations for both ESLint and Prettier, is as follows:

> There isn't always a "right" or "wrong" answer, but it is better to choose than not to choose.

In other words, while there certainly are rules and configuration options that should be favored due
to technical reasons related to the reduction of bugs, there are also many rules and configuration
options that are purely stylistic, and decisions regarding their usage (or lack thereof) have been
historically made based on a matter of opinion.

However, it is better to make a decision than to leave them unanswered, so that time is spent
building what matters rather than arguing about code style.

#### Updating Configurations

This philosophy should not be mistaken with the idea that the configurations for both ESLint and
Prettier are not subject to change, due to changes in the codebase or the tools it depends on. The
configurations should be revisited whenever a rule is consistently working against the code rather
than for it.

### Spelling

Spelling is checked separately from linting, using [cspell](https://cspell.org). The configuration
lives in [`cspell.config.mjs`](../../cspell.config.mjs), and project-specific terms are kept in
[`dictionary.txt`](../../dictionary.txt), a lowercase, one-word-per-line list that cspell treats as
an additional dictionary. Run it with `pnpm cspell`.

When cspell flags a word, resolve it deliberately rather than ignoring the warning. There are three
distinct cases, and the right response depends on what the word actually is:

1. **It is a genuine misspelling.** Correct the typo in place. This is the common case.
2. **It is spelled correctly but is a domain term cspell does not know.** Add it to `dictionary.txt`
   as a new lowercase entry. cspell matches case-insensitively, so one entry covers every casing. A
   reliable signal for this case is repetition: if the same word appears several times in a file
   (for example `jsonifier` referenced six times), the flag almost certainly means the term is
   missing from the dictionary rather than misspelled.
3. **It is intentionally not a word.** For deliberate gibberish, encoded values, or fragments of a
   regular expression, suppress the single line with a `cspell:disable-next-line` directive on the
   line above it (the `<!-- cspell:disable-next-line -->` form in Markdown). Prefer a single-line
   disable over a block, and never disable spell checking for an entire file to hide one word.

Adding a recurring term to the dictionary is almost always better than scattering line-level
disables across the codebase.

---

## Frontend Development

This section outlines best practices for React and Next.js development.

### React Component Design

#### Returning Fragments

When a component returns multiple JSX elements, wrap them in a React Fragment (`<>...</>`) rather
than an unnecessary `div`:

```tsx
// Preferred
export const MyComponent = () => (
  <>
    <Header />
    <Content />
  </>
);

// Avoid unnecessary wrapper divs
export const MyComponent = () => (
  <div>
    <Header />
    <Content />
  </div>
);
```

#### Component Definitions

Named components are defined as arrow functions, which is enforced by
`react/function-component-definition`.

### Props & State Conventions

#### Read Only Props

The props that a component or hook accept should always be typed as `readonly`. This helps prevent
cases where a component or hook may accidentally mutate the props that it accepts - which is not
only a bad practice, but can lead to bugs and unexpected behavior in the application.

There is an ESLint rule to enforce that the props that a _component_ accepts are always typed as
`readonly`, `react/prefer-read-only-props`, but it doesn't apply to hooks and it does not always
properly detect the props structure of a component. In cases that the rule does not handle the
`readonly` treatment for you, it is up to the developer to ensure that the props that the component
and/or hook accepts are properly typed as `readonly`.

#### Interface & Type Usage

When possible, `interface`(s) should be favored over types when defining the props for a component.
This is because interfaces are more amenable to prop extension, since properties that are present in
the base `interface` are overridden rather than the property in the resulting type being an
intersection of the two:

```ts
type BaseProps = {
  readonly propA: string;
};

// This will result in { readonly propA: string & number }
type ExtendedProps = {
  readonly propA: number;
} & BaseProps;
```

#### Prop Naming Conventions

Proper naming of props and state variables is an important aspect of writing clean, readable code in
React. Poor or inconsistent naming can lead to confusion and bugs, particularly as the codebase
grows in size and complexity, and as props and state variables are passed between larger layers of
components.

Whenever props are defined for a component, they should be named after the component they are being
used with, with `Props` as a suffix. For instance, if the component's name is `MyComponent`, the
name of the props `interface` (or type in some cases) should always be `MyComponentProps`.

This helps avoid confusion when extending or modifying components, because those prop structures
will usually need to be imported and extended by the component that is wrapping the original.

##### Boolean Props

Boolean props and state variables should be named using React's boolean prop naming conventions. The
naming of boolean props is enforced via an ESLint rule, `react/boolean-prop-naming`. This rule
enforces that the names of boolean props are prefixed with either `is`, `are`, `will`, `has`,
`should` or `can`.

```ts
interface MyComponentProps {
  readonly areMenuItemsEditable?: boolean;
  readonly isDisabled?: boolean;
}
```

While it is not as easily enforceable in the case of state variables, boolean state variables should
still attempt to follow the same naming conventions as boolean props:

```ts
export const MyComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
};
```

##### Functions & Event Handlers

Props that represent event handlers should always be prefixed with `on`:

```ts
interface MyComponentProps {
  readonly onClick?: () => void;
  readonly onClose?: (reason: string) => void;
}
```

This should be the case for all functions that are passed as props to a component - with few
exceptions - because all components should be designed to lift state up to the nearest common parent
with event handlers.

#### Properly Extending/Exposing Props

When a component wraps (or extends) another component, especially reusable components that exist in
[`src/components/`](../../src/components), it should **always** extend the props structure of the
component that is being wrapped. [`TabButton`](../../src/components/buttons/TabButton.tsx) is an
example: it extends `ButtonProps` and omits only the props it fixes internally.

#### Input Components

Components that are considered to be "input" components (which will usually either exist in
[`src/components/input/`](../../src/components/input) or a feature-specific module in
`src/features/$featureName/components/`) should always expose the following props:

1. `initialValue`
2. `value`
3. `onChange`

The props should be named as such to ensure consistency with the rest of the input components in the
codebase and to simplify form construction around them.

### Third-Party Components

Third-party component libraries are used sparingly in this repository.
[Mantine](https://mantine.dev) provides a small number of components (such as `Pagination` and
`Timeline`), while the rest of the UI is built from components in
[`src/components/`](../../src/components) styled with Tailwind and SCSS.

#### Internalization

Internalization is a process where components from third-party libraries are still associated with
an internally defined, single-source-of-truth component. This internalized component acts as the
root of the component's extension/ancestry tree, making it easier to apply overrides, defaults and
behavior that should consistently apply across all usages of the component in the application.

The goal of internalization is to make it easier to replace the component with a new component in
the future, if necessary. It allows a third-party library to be used without embedding it in the
application's codebase as systemically.

```tsx
// src/components/pagination/Paginator.tsx
import { Pagination } from '@mantine/core';

export interface PaginatorProps extends Pick<ComponentProps, 'className'> {
  readonly count: number;
  readonly pageSize?: number;
}

export const Paginator = ({ count, pageSize = 10, ...props }: PaginatorProps) => (
  <Pagination {...props} total={Math.ceil(count / pageSize)} />
);
```

The benefits of internalization are as follows:

1. **Consistency**: Overrides, defaults and constant behavior/appearances can be applied to all
   extensions of the component in a single file.
2. **Dependency Management**: Features can use these components without needing to import the
   third-party library directly, keeping usage of that library isolated to a small number of files.
3. **Versioning**: It makes it easier to version the component and potentially replace it with a new
   component in the future through deprecation and eventual replacement.

As much as possible, components should be designed such that they stem from internalized components
at some point in the tree. As with many things, there will be exceptions to this. For some
components, internalization might not make sense (most likely for purely structural elements).
However, internalization can pay large dividends down the line for themed, appearance-based
components.

---

## Code Organization

This section outlines best practices for organizing and structuring code in the repository.

### Modularization

Code should be organized in a way that promotes the modularization and isolation of code such that
its logic and dependencies can be effectively colocated and self-contained inside of smaller units
of logic, which we define as **modules**. A module should be responsible for properly encapsulating
related logic, only exposing what is necessary for use external to the module.

The top-level modules under [`src/`](../../src) are grouped into layers, defined by `ModuleGroups`
in [`tooling/eslint-config-web/constants.mjs`](../../tooling/eslint-config-web/constants.mjs), which
run from the most foundational layer to the most user-facing:

1. `application`, `lib`, `server`, `database`, `internal`, `scripts`, `support`
2. `app`, `actions`, `api`, `integrations`, `environment`
3. `components`, `features`, `hooks`, `styles`

This ordering drives the position that each group's imports occupy inside the `internal` group of
the `import/order` rule, so an import of a lower layer always appears above an import of a higher
layer.

### Benefits

The benefits of improved modularization are as follows:

1. **Importing**: Cleaner import patterns & more intuitive/consistent dynamic import patterns.
2. **Bundle Size & Performance**: Opportunities for bundle size reduction and performance
   optimization become clearer as UI elements with similar dependencies are grouped together, and
   the dependencies of a given file are the primary determination of whether or not that file should
   be dynamically imported.
3. **Colocation**: Related logic lives closer together and is isolated from unrelated logic.
4. **Versioning & Deprecation**: Code can be more easily versioned, deprecated, and gradually
   replaced as related logic lives closer together and is encapsulated in smaller modules.
5. **Clutter & Ambiguity**: Modularization promotes a less cluttered structure, particularly as the
   project grows. There is less ambiguity about where logic should live, and it is easier to locate
   and/or find specific logic related to a given component type or piece of business logic.
6. **Next.js**: It is better suited for Next.js projects, as server/client boundaries become
   clearer.

### Import/Export Patterns

Every first-party module is addressed through the `~/` alias, which maps to the `src` directory. By
convention, an import that crosses into another top-level module is performed absolutely via the
alias:

```ts
// Inside of the file src/components/buttons/generic/Button.tsx
import { capitalize } from '~/lib/formatters';
import { getButtonSizeStyle } from '~/components/buttons/util';
```

Imports within a module remain relative — siblings in the same directory, and nearby parent
directories, including module-local folders that happen to share a name with a top-level module (for
example a feature's own `../lib/`):

```ts
// Inside of the file src/components/buttons/TabButton.tsx
import { Button, type ButtonProps } from './generic';

// Inside of the file src/documents/resume/components/Role.tsx
import { logo } from '../lib/assets';
```

This has the following benefits:

1. It makes it easier to relocate, remove and/or replace modules in the application.
2. It makes it easier to encapsulate logic inside of the module, only exposing what is necessary for
   external use of the module.
3. It helps to avoid situations with circular imports.
4. It produces cleaner import patterns, where the current module's content is more obvious when
   importing from files both internal and external to the module that a given file is in.

Import ordering itself is mechanical and enforced by `import/order`, so it should never be
hand-maintained.

### File & Folder Naming

The casing of a file's name is determined by what the file exports, and the casing of a folder's
name is always the same.

#### Component Files

A **component file** is any file that exports a React component. Whether a file is a component file
is determined by what it exports, not by its extension - a `.ts` file that exports a component
without containing any JSX is still a component file. Component files are named in PascalCase after
the component they export:

```
src/components/buttons/TabButton.tsx   →  exports TabButton
```

A component file must export exactly **one** component. If a file exports two components, it should
be split into two files, one per component. Non-component exports that belong to the component may
live in the same file: its props interface or type (`TabButtonProps`), and closely related types or
constants that exist only to support it.

**Exception - Next.js reserved files**: Files whose names are reserved by the Next.js App Router
keep their reserved lowercase names, in either extension (`page.ts` or `page.tsx`): `page`,
`layout`, `template`, `loading`, `error`, `global-error`, `not-found`, `default`, `route`,
`sitemap`, and the other reserved entries under [`src/app/`](../../src/app). These names are
dictated by the framework and are never converted to PascalCase.

#### All Other Files

Every file that does not export a component is named in hyphen-case (kebab-case): hooks
(`use-filter-state.ts`), utilities (`get-entity.ts`), types modules, configs, scripts, and Markdown
documentation (`best-practices.md`). Single-word names (`query.ts`, `util.ts`) already satisfy this.

The one exception is `README.md`, which keeps its conventional uppercase name and is never renamed.

#### Folders

Folders are always named in hyphen-case. PascalCase folders are disallowed, even when the folder
groups the internals of a single component.

In particular, a folder must never stand in for a component file: a folder whose `index.tsx` (or
`index.ts`) implements a component is disallowed. A component implementation always lives in its own
PascalCase file, and index files exist only as barrels that re-export a module's public API.

```
Disallowed: the folder is a modularized component "file".
  components/icons/Icon/index.tsx

Correct: the component lives in its own PascalCase file.
  components/icons/Icon.tsx

Correct: internals need their own files, so a hyphen-case module wraps them.
  components/icons/icon/Icon.tsx
  components/icons/icon/util.ts
  components/icons/icon/index.ts    (re-exports only)
```

#### Applying the Convention

These rules govern new files and deliberate restructures. Parts of the codebase predate the
convention; existing files and folders should not be mass-renamed as a side effect of unrelated
work. When a file is already being split, moved, or rewritten, bring its name (and its folder's
name) into conformance as part of that change.

The prescriptive, agent-facing version of this convention lives in
[`.claude/rules/code-quality/file-naming.md`](../../.claude/rules/code-quality/file-naming.md) and
[`.github/instructions/code-quality/file-naming.instructions.md`](../../.github/instructions/code-quality/file-naming.instructions.md).

### Other Structure Conventions

- **Tests**: Located under [`src/__tests__/`](../../src/__tests__) as `*.test.ts` or `*.test.tsx`
- **Routes**: Follow the Next.js App Router conventions under [`src/app/`](../../src/app)
