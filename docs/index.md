# Documentation Index

This directory contains human-readable documentation for the `nick.florin` web application. All
documentation is written in standard Markdown, formatted by Prettier.

Setup, local development, database and deployment instructions live in the
[repository README](../README.md), not here.

## Documentation Structure

### 📚 Code Quality

- [Overview](./code-quality/index.md) - Quick navigation for the code quality documentation
- [Best Practices](./code-quality/best-practices.md) - Commenting, linting philosophy, spelling,
  React conventions, file and folder naming, and code organization
- [Linting & Formatting](./code-quality/linting.md) - ESLint and Prettier commands, IDE integration
  and rule-disable policy
- [Markdown Formatting](./code-quality/markdown-formatting.md) - How Markdown files are formatted
  and checked
- [TypeScript: Types & Interfaces](./code-quality/typescript/types-interfaces.md) - Readonly
  modifiers on type and interface properties
- [TypeScript: Variable Naming](./code-quality/typescript/variable-naming.md) - PascalCase for
  module-scope constants, camelCase for locals and functions
- [TypeScript: Exhaustive Type Checking](./code-quality/typescript/exhaustiveness.md) - Handling
  every member of a union or enum in a form the compiler verifies
- [TypeScript: Type Guards & Assertions](./code-quality/typescript/type-guards.md) - Type
  predicates, finite unions derived from arrays, and `asserts value is X` functions
- [TypeScript: Indexed Access](./code-quality/typescript/indexed-access.md) - Indexing arrays and
  records safely while `noUncheckedIndexedAccess` is off
- [TypeScript: Unsafe Type Coercion](./code-quality/typescript/type-coercion.md) - `unknown` over
  `any`, validating untrusted data, and the narrow cases where an `as` assertion is legitimate

- [React: Overview](./code-quality/react/index.md) - Quick navigation for the React conventions, and
  how the vendored Vercel skills relate to them
- [React: Performance](./code-quality/react/performance.md) - Waterfalls, bundle size, the
  server/client boundary, and re-renders
- [React: Composition](./code-quality/react/composition.md) - Boolean props, explicit variants,
  children over render props, and lifting state into a provider

### ✍️ Documentation

- [Overview](./documentation/index.md) - Quick navigation for the documentation-authoring
  conventions
- [Code Examples](./documentation/code-examples.md) - Illustrating documented code concepts with
  fenced code blocks rather than prose alone

### 🗂️ Projects

Long-running project working context (status, decisions, codebase maps) lives under
[projects/](./projects/):

- [Resume Generation](./projects/resume-generation/README.md) - Centralizing all portfolio/resume
  content under a single source of truth with per-medium distribution
- [App Performance](./projects/app-performance/README.md) - Restoring SSR of page content,
  maximizing first paint, eliminating load flicker, and cutting bundle/payload size
- [Repo Cleanup](./projects/repo-cleanup/README.md) - General repository maintenance: dependency
  upgrades, tooling modernization, and convention simplification
- [UX Enhancements](./projects/ux-enhancements/README.md) - An umbrella for small, independent
  user-facing polish items: visual refinements, sizing, and interaction improvements

## AI Instructions vs Human Documentation

This repository separates AI-focused instructions from human-readable documentation.

### AI Instructions

Prescriptive directives for AI assistants are maintained in two parallel locations:

- [.github/instructions/](../.github/instructions/README.md) for GitHub Copilot
- `.claude/rules/` for Claude Code

Both locations contain identical rule content and differ only in frontmatter format. They cover code
comments and JSDoc, ESLint usage and rule disables, cspell handling, file and folder naming, and
string quoting and wrapping. These files are **prescriptive** and use imperative language targeting
AI code generation.

### `/docs` - Human Documentation (this directory)

Contains explanatory documentation for human developers: conceptual explanations, rationale behind
the tooling choices, and the conventions the codebase follows. This documentation is **descriptive**
and aims to help developers understand and work with the system.

## Contributing to Documentation

When adding or updating documentation:

1. Use clear, concise language
2. Follow the existing directory structure
3. Keep files focused on a single topic
4. Link to related documentation where appropriate
5. Add the new file to this index and to the relevant section index
6. Run `pnpm format` so Prettier wraps the prose to 100 characters

For AI-focused instructions (prescriptive rules for code generation), update the files in
`.claude/rules/` and `.github/instructions/` instead, keeping the two locations in sync.
