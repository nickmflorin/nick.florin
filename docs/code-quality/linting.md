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

## Rule Substitutions

Some core ESLint rules are kept `off` deliberately because an equivalent plugin implementation is
enabled in their place. The substitution and its reason are recorded as a comment at both rule
entries in the configuration.

| Core rule (`off`, in `base.mjs`) | Replacement (`error`, in `unicorn.mjs`) | Why                                          |
| -------------------------------- | --------------------------------------- | -------------------------------------------- |
| `no-negated-condition`           | `unicorn/no-negated-condition`          | The core rule has no autofix; unicorn's does |

The two implementations report the same violation: a negated test in an `if`/`else` or a ternary,
where flipping the condition lets the branches read positively. Because the unicorn implementation
is auto-fixable, the formatting runs (`pnpm format`, `pnpm eslint:format:fast`) correct it by
swapping the branches:

```typescript
// Disallowed: the negated test forces the reader to invert the branches.
const label = value !== undefined ? compute(value) : fallback;

// Correct (and what the autofix produces): the condition reads positively.
const label = value === undefined ? fallback : compute(value);
```

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
