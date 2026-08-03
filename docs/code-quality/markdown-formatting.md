# Markdown Formatting and Linting

## Overview

Markdown files (`**/*.md`) in this repository are **formatted by Prettier**, not linted by ESLint.

## Why Not ESLint?

Markdown files are explicitly ignored by the ESLint configuration (`**/*.md` in
[`tooling/eslint-config-web/configs/ignores.mjs`](../../tooling/eslint-config-web/configs/ignores.mjs)).
Prettier already handles everything that matters for prose - wrapping, spacing, list and table
formatting - and a markdown-specific linter has not been worth the additional tooling for a
repository of this size.

## Current Setup

### Prettier (Formatting)

Markdown files are automatically formatted by Prettier with these settings (from
[`.prettierrc.yaml`](../../.prettierrc.yaml)):

```yaml
proseWrap: always # Wrap prose at printWidth
printWidth: 100 # Max line length
```

**Run formatting:**

```bash
# Check formatting
pnpm prettier

# Fix formatting
pnpm prettier:format
```

### What Prettier Does

Prettier handles:

- Line wrapping at 100 characters
- Consistent spacing
- List formatting
- Code block formatting
- Table alignment

### What Prettier Doesn't Do

Prettier is a formatter, not a linter. It doesn't check for:

- Broken links
- Spelling errors (those are covered separately by `pnpm cspell` - see
  [Best Practices → Spelling](./best-practices.md#spelling))
- Markdown syntax errors (beyond what affects formatting)
- Accessibility issues in markdown

## VS Code Integration

VS Code users should have the Prettier extension installed for automatic formatting on save:

1. Install:
   [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Configure format on save in VS Code settings

## Best Practices

When writing markdown:

1. **Run `pnpm prettier:format` before committing** - This ensures consistent formatting
2. **Keep lines under 100 characters** - Prettier will wrap automatically
3. **Use proper heading hierarchy** - Don't skip levels (h1 → h2 → h3)
4. **Test code examples** - Code blocks in docs should be valid
5. **Use relative links** - For internal documentation references
6. **Add alt text to images** - For accessibility

## Checking Markdown

### Format Check

```bash
# Check all markdown files
pnpm prettier

# Check specific files
pnpm exec prettier --check "docs/**/*.md"
```

### Format Fix

Note that running `pnpm format` will run both Prettier and ESLint's auto-fix. There are more
specific scripts defined in the [package.json](../../package.json).

```bash
# Format all files (Prettier + ESLint --fix)
pnpm format

# Format specific markdown files
pnpm exec prettier --write "docs/**/*.md"
```

## CI/CD

The CI pipeline checks markdown formatting as part of the `pnpm lint` command, which includes:

```bash
pnpm prettier # Checks all files including markdown
```

If markdown files are not properly formatted, the CI build will fail.
