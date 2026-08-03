# AI Instructions

This directory contains prescriptive instructions for AI code generation assistants. These files
define rules, constraints, and patterns that AI should follow when generating or modifying code.

## Dual-Location Parity

These instructions are maintained in **two locations** to support different AI tools:

| Location                | Tool           | Frontmatter    |
| ----------------------- | -------------- | -------------- |
| `.github/instructions/` | GitHub Copilot | `applyTo` glob |
| `.claude/rules/`        | Claude Code    | `paths` array  |

**Both locations must contain identical rule content.** Only the frontmatter format differs.

When updating any instruction file:

1. Make the content change in **both** locations
2. Each file has a `<!-- Parity: keep in sync with ... -->` comment pointing to its counterpart
3. Verify the counterpart file is updated before committing

The `PostToolUse` hook at
[.claude/hooks/parity-sync-reminder.mjs](../../.claude/hooks/parity-sync-reminder.mjs) reminds
Claude Code of a file's sync group whenever one member of the group is edited, and the
[sync-ai-config](../../.claude/skills/sync-ai-config/SKILL.md) skill can audit or reconcile the two
locations on demand.

## Purpose

Unlike the human-readable documentation in [docs/](../../docs/index.md), these instruction files:

- Use **imperative language** (must, should, never)
- Provide **prescriptive rules** for code generation
- Define **constraints and requirements** for AI assistants
- Specify **technology-specific patterns** and anti-patterns

## Instruction Files

| File                                                       | Purpose                                                      | Applies To                  |
| ---------------------------------------------------------- | ------------------------------------------------------------ | --------------------------- |
| `codebase-index.instructions.md`                           | Codebase map: routes, APIs, actions, domains, placement      | All files                   |
| `discovery.instructions.md`                                | Discovery and context loading policy for AI agents           | All files                   |
| `code-quality/code-comments.instructions.md`               | JSDoc and commenting standards                               | TypeScript/JavaScript files |
| `code-quality/eslint.instructions.md`                      | ESLint usage and rule-disable policy                         | TypeScript/JavaScript files |
| `code-quality/file-naming.instructions.md`                 | File/folder casing: PascalCase components, hyphen-case       | TS/JS + Markdown files      |
| `code-quality/typescript/types-interfaces.instructions.md` | Type/interface declaration conventions (readonly properties) | TypeScript files            |
| `code-quality/spelling.instructions.md`                    | cspell handling: fix, add to dictionary, or disable          | TS/JS + Markdown files      |
| `code-quality/strings.instructions.md`                     | String quoting, line length, and `+` wrapping                | TypeScript/JavaScript files |
| `workflow/verification-commands.instructions.md`           | Which checkers may be run automatically                      | All files                   |

Both Claude Code and Copilot discover instruction files recursively, so the `code-quality/` and
`workflow/` subdirectories do not affect which files load or when.

## How AI Tools Use These Files

**GitHub Copilot** (`.github/instructions/`):

1. Identifies which instruction files apply to the current file (via `applyTo` patterns)
2. Uses the instructions as constraints for code generation
3. Follows the prescriptive rules when suggesting code changes

**Claude Code** (`.claude/rules/`):

1. Loads rules matching the current file (via `paths` array in frontmatter)
2. Applies rules as constraints for code generation and modifications
3. Follows the prescriptive rules when making changes

## Human Documentation

For human-readable documentation, explanations, and tutorials, see:

- [docs/index.md](../../docs/index.md) - Documentation index
- [docs/code-quality/](../../docs/code-quality/index.md) - Code quality standards and tooling
- [README.md](../../README.md) - Setup, local development, and deployment

## Updating Instructions

When updating these files:

1. Keep language **prescriptive** (use "must", "should", "never")
2. Focus on **rules and constraints** for code generation
3. Provide **clear examples** of correct and incorrect patterns
4. Update the `applyTo` glob pattern if scope changes
5. Keep instructions **concise and focused**

## Example: Instructions vs Documentation

### In `code-quality/code-comments.instructions.md` (for AI):

```markdown
Use JSDoc for documenting APIs. Avoid inline (`//`) and block (`/* */`) comments inside the body of
a piece of code. Prefer making the code self-explanatory through extraction and naming over
explaining it with a comment.
```

### In [docs/code-quality/best-practices.md](../../docs/code-quality/best-practices.md) § Commenting Code (for humans):

```markdown
When writing comments or documenting APIs via JSDoc, consider:

1. Comments should be written in formal English with appropriate punctuation
2. Comments should be thorough and easy for other developers to understand
3. Comments should explain "why", not just "what"
```

The instructions are **directive** (must do), while documentation is **explanatory** (how to do).
