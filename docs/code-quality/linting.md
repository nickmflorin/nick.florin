# Linting & Formatting

This repository uses ESLint and Prettier to enforce code quality and consistent formatting. See
[Best Practices](./best-practices.md#linting--formatting) for detailed information about the linting
philosophy and configuration.

The ESLint configuration is a local package,
[`@nickflorin/eslint-config-web`](../../tooling/eslint-config-web), linked from
`tooling/eslint-config-web` and consumed by [`eslint.config.mjs`](../../eslint.config.mjs) at the
repository root. The individual rule sets live in
[`tooling/eslint-config-web/configs/`](../../tooling/eslint-config-web/configs). The Prettier
configuration lives in [`.prettierrc.yaml`](../../.prettierrc.yaml).

## Quick Commands

```bash
# Check for linting and formatting issues
pnpm lint

# Check for linting errors only (warnings suppressed) and formatting
pnpm lint:errors

# Check formatting only
pnpm prettier

# Fix formatting and auto-fixable lint issues
pnpm format

# Lint and fix only the files changed relative to HEAD
pnpm eslint:changed
```

The cached variants (`pnpm eslint:cached`, `pnpm eslint:format:fast`) reuse ESLint's cache for
faster subsequent runs.

## IDE Integration

For the best development experience, install the ESLint and Prettier extensions in your editor:

- **VS Code**: ESLint and Prettier extensions
- **WebStorm**: Built-in ESLint and Prettier support

## CI Enforcement

All pull requests must pass:

- ESLint checks (no errors)
- Prettier formatting checks
- TypeScript type checking (`pnpm tsc`)

## Disabling Rules

Disabling an ESLint rule is a last resort. A rule should only be disabled when it is falsely
reporting a violation, or when there is genuinely no other way to write the code that satisfies it
due to a technical or business-logic constraint. If the code can be rewritten to satisfy the rule,
do that instead of disabling it.

When a disable is unavoidable, scope it to a single line (or a small `eslint-disable` /
`eslint-enable` block), name the specific rule, and add an explanation after a `--` separator. See
[Best Practices → ESLint Disable Comments](./best-practices.md#eslint-disable-comments) for the
directive conventions. The authoritative, agent-facing policy lives alongside the other code rules
in
[`.github/instructions/code-quality/eslint.instructions.md`](../../.github/instructions/code-quality/eslint.instructions.md)
(and [`.claude/rules/code-quality/eslint.md`](../../.claude/rules/code-quality/eslint.md)).
