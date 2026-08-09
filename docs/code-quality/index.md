# Code Quality

Guides covering the code quality standards, conventions and tooling used in this repository.

## Quick Navigation

| I want to...                      | Go to                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Understand code quality standards | [Best Practices](./best-practices.md)                                            |
| Set up linting and formatting     | [Linting & Formatting](./linting.md)                                             |
| Format markdown files             | [Markdown Formatting](./markdown-formatting.md)                                  |
| Write and document comments       | [Best Practices → Commenting Code](./best-practices.md#commenting-code)          |
| Resolve a spelling warning        | [Best Practices → Spelling](./best-practices.md#spelling)                        |
| Disable an ESLint rule            | [Linting → Disabling Rules](./linting.md#disabling-rules)                        |
| Build React components            | [Best Practices → Frontend](./best-practices.md#frontend-development)            |
| Name props and state variables    | [Best Practices → Props & State](./best-practices.md#props--state-conventions)   |
| Organize code modules             | [Best Practices → Code Organization](./best-practices.md#code-organization)      |
| Name files and folders            | [Best Practices → File & Folder Naming](./best-practices.md#file--folder-naming) |
| Declare types and interfaces      | [TypeScript → Types & Interfaces](./typescript/types-interfaces.md)              |
| Name a module-scope constant      | [TypeScript → Variable Naming](./typescript/variable-naming.md)                  |
| Branch on a union or enum         | [TypeScript → Exhaustive Type Checking](./typescript/exhaustiveness.md)          |
| Write a type guard or assertion   | [TypeScript → Type Guards & Assertions](./typescript/type-guards.md)             |
| Index an array or record safely   | [TypeScript → Indexed Access](./typescript/indexed-access.md)                    |
| Know whether an `as` cast is okay | [TypeScript → Unsafe Type Coercion](./typescript/type-coercion.md)               |
| Validate untrusted data with Zod  | [TypeScript → Unsafe Type Coercion](./typescript/type-coercion.md)               |
| Avoid a data-fetching waterfall   | [React → Performance](./react/performance.md)                                    |
| Reduce the client bundle          | [React → Performance](./react/performance.md)                                    |
| Design a component's props        | [React → Composition](./react/composition.md)                                    |
| Declare a component and its props | [React → Component Definitions](./react/component-definitions.md)                |

## Document Overview

### [Best Practices](./best-practices.md)

Comprehensive guide covering code quality standards and patterns across the stack:

- **General Practices**: Commenting, linting and formatting philosophy, spelling
- **Frontend Development**: React component design, props/state conventions, internalization of
  third-party components
- **Code Organization**: Module structure, import patterns, file and folder naming

**Key Topics:**

- JSDoc and inline comments
- ESLint and Prettier configuration
- cspell and the project dictionary
- React component prop extension
- Import/export conventions
- PascalCase component files and hyphen-case everything else

### [Linting & Formatting](./linting.md)

Quick reference for code quality tooling:

- ESLint configuration and usage
- Prettier formatting standards
- IDE integration
- The policy for disabling rules

### [TypeScript](./typescript/index.md)

Conventions specific to TypeScript declarations:

- [Types & Interfaces](./typescript/types-interfaces.md): the `readonly` modifier on every type and
  interface property, what the convention governs, and when omitting it is justified
- [Variable Naming](./typescript/variable-naming.md): PascalCase for module-scope constants rather
  than `SCREAMING_SNAKE_CASE`, and what the convention does not cover
- [Exhaustive Type Checking](./typescript/exhaustiveness.md): handling every member of a union or
  enum in a compiler-verified form, `assertNever`, and slicing unions with `Extract`/`Exclude`
- [Type Guards & Assertions](./typescript/type-guards.md): type predicates, deriving finite unions
  from `readonly` arrays, cast direction inside a guard, and `asserts value is X` functions
- [Indexed Access](./typescript/indexed-access.md): indexing safely without
  `noUncheckedIndexedAccess`, and the `no-unnecessary-condition` interaction
- [Unsafe Type Coercion](./typescript/type-coercion.md): `unknown` over `any`, the type-level cases
  where an `as` assertion is legitimate, `as const` versus `satisfies`, Zod at trust boundaries, and
  the `Response.json()` pattern

### [React](./react/index.md)

Conventions specific to React and Next.js:

- [Performance](./react/performance.md): eliminating `await` waterfalls, keeping barrel imports out
  of client code, dynamic imports for heavy components, minimizing what crosses the server/client
  boundary, and using a ternary rather than `&&` in JSX
- [Composition](./react/composition.md): boolean props describe state rather than identity, explicit
  variant components, `children` over markup-only render props, and lifting state into a provider
- [Component Definitions](./react/component-definitions.md): `FC`-typed `const` arrow functions,
  props as an `interface` named `{Component}Props`, and inline props annotations for generic
  components

Performance and Composition are deliberate subsets of Vercel Engineering's agent skills, which are
vendored into `.claude/skills/` and consulted on demand — see
[React → The Vercel Skills](./react/index.md).

### [Markdown Formatting](./markdown-formatting.md)

Detailed guide for markdown documentation:

- Prettier configuration for markdown
- Why ESLint does not lint markdown
- VS Code integration
- Best practices for documentation

## Development Workflow

### Before You Start

1. **Read**: [Best Practices](./best-practices.md) for code quality standards
2. **Setup**: [Linting & Formatting](./linting.md) in your IDE

### Before Submitting a PR

1. **All tests pass**: `pnpm test:ci`
2. **No type errors**: `pnpm tsc`
3. **No linting errors**: `pnpm lint`
4. **Formatted code**: `pnpm format`
5. **No spelling errors**: `pnpm cspell`

## Common Commands

```bash
# Code quality
pnpm lint                # Run ESLint and check Prettier formatting
pnpm lint:errors         # Run ESLint with warnings suppressed
pnpm format              # Fix formatting with Prettier and ESLint
pnpm eslint:changed      # Lint and fix only the changed files
pnpm cspell              # Run cspell across the repository
pnpm tsc                 # Type check the project

# Testing
pnpm test                # Run Jest in watch mode
pnpm test:ci             # Run Jest once, as CI does
```

## Philosophy

### Code Quality

> Clean, organized code that follows best practices is a requirement, not a "nice to have".

The priorities are:

- **Consistency** over individual preference
- **Readability** over cleverness
- **Type safety** over flexibility

### Linting & Formatting

> There isn't always a "right" or "wrong" answer, but it is better to choose than not to choose.

Strict configurations reduce ambiguity so that development time goes toward building features rather
than debating code style.

## Additional Resources

The prescriptive, agent-facing versions of these standards live alongside the human documentation:

- [Code Comments](../../.claude/rules/code-quality/code-comments.md) - JSDoc and commenting
  standards
- [ESLint](../../.claude/rules/code-quality/eslint.md) - ESLint usage and the rule-disable catalog
- [File Naming](../../.claude/rules/code-quality/file-naming.md) - PascalCase component files,
  hyphen-case everything else
- [Spelling](../../.claude/rules/code-quality/spelling.md) - Resolving cspell flags
- [Strings](../../.claude/rules/code-quality/strings.md) - String quoting, line length and wrapping
- [Types & Interfaces](../../.claude/rules/code-quality/typescript/types-interfaces.md) - Readonly
  modifiers on type and interface properties
- [Variable Naming](../../.claude/rules/code-quality/typescript/variable-naming.md) - PascalCase for
  module-scope constants, camelCase for locals and functions
- [Exhaustive Type Checking](../../.claude/rules/code-quality/typescript/exhaustiveness.md) - No
  fallthrough or value-producing `default` clauses over finite types
- [Type Guards](../../.claude/rules/code-quality/typescript/type-guards.md) - Type predicates,
  finite unions derived from arrays, and assertion functions
- [Indexed Access](../../.claude/rules/code-quality/typescript/indexed-access.md) - Safe array and
  record indexing while `noUncheckedIndexedAccess` is off
- [Unsafe Type Coercion](../../.claude/rules/code-quality/typescript/type-coercion.md) - `unknown`
  over `any`, validation at boundaries, and the narrow cases where an assertion is legitimate
- [React Performance](../../.claude/rules/code-quality/react/performance.md) - Waterfalls, bundle
  size, the server/client boundary, and re-renders
- [React Composition](../../.claude/rules/code-quality/react/composition.md) - Boolean props,
  explicit variants, children over render props, and lifting state
- [React Component Definitions](../../.claude/rules/code-quality/react/component-definitions.md) -
  `FC`-typed `const` arrow functions, interface props named `{Component}Props`, and generic
  components

Each of these has a GitHub Copilot counterpart in
[.github/instructions/code-quality/](../../.github/instructions/README.md).

Claude Code additionally loads on-demand **skills** from `.claude/skills/`, which have no Copilot
counterpart: `vercel-react-best-practices` and `vercel-composition-patterns` hold the full Vercel
corpora that the two React rules above are subsets of.

## Contributing

When adding new code quality guides:

1. Keep documentation **clear and concise**
2. Include **code examples** where helpful, drawn from real code in this repository
3. Update this index with new quick navigation entries
4. Add the document to the [documentation index](../index.md)
