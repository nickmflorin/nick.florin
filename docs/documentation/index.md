# Documentation

Guides covering how documentation itself is written in this repository — the content conventions,
not the tooling. For how Markdown files are formatted and checked, see
[Markdown Formatting](../code-quality/markdown-formatting.md).

## Quick Navigation

| I want to...                              | Go to                                                         |
| ----------------------------------------- | ------------------------------------------------------------- |
| Document a code concept                   | [Code Examples](./code-examples.md)                           |
| Decide between an inline span and a block | [Code Examples → Inline Spans and Blocks](./code-examples.md) |
| Show a correct and an incorrect form      | [Code Examples → Show Both Forms](./code-examples.md)         |
| Know whether a human guide needs examples | [Code Examples → Human Guides](./code-examples.md)            |

## Document Overview

### [Code Examples](./code-examples.md)

Illustrating documented code concepts with fenced code blocks rather than prose alone: why inline
spans do not substitute for a block, showing the correct and incorrect form side by side with
labelled comments, language tags and why they matter, drawing examples from real repository code,
quoting the compiler or linter error a rule exists for, and why the human guides need examples as
much as the prescriptive rules do.

## AI Instructions

The prescriptive counterparts of these conventions for AI code generation live in
`.claude/rules/documentation/` (Claude Code) and `.github/instructions/documentation/` (GitHub
Copilot), which are maintained as parity copies of each other.
