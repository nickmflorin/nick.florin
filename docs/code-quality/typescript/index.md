# TypeScript

Guides covering the TypeScript conventions used in this repository.

## Quick Navigation

| I want to...                  | Go to                                                            |
| ----------------------------- | ---------------------------------------------------------------- |
| Declare a type or interface   | [Types & Interfaces](./types-interfaces.md)                      |
| Mark type properties readonly | [Types & Interfaces → Readonly](./types-interfaces.md)           |
| Name a module-scope constant  | [Variable Naming](./variable-naming.md)                          |
| Name a local variable         | [Variable Naming → What It Does Not Cover](./variable-naming.md) |

## Document Overview

### [Types & Interfaces](./types-interfaces.md)

Conventions for declaring object shapes: the `readonly` modifier on every type and interface
property, what the convention does and does not govern, and when omitting the modifier is justified.

### [Variable Naming](./variable-naming.md)

Conventions for naming variables: PascalCase for module-scope constants rather than
`SCREAMING_SNAKE_CASE`, camelCase for locals and for functions bound to a constant, and why ESLint
does not catch a violation.

## AI Instructions

The prescriptive counterparts of these conventions for AI code generation live in
`.claude/rules/code-quality/typescript/` (Claude Code) and
`.github/instructions/code-quality/typescript/` (GitHub Copilot), which are maintained as parity
copies of each other.
