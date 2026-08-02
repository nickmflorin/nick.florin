---
name: sync-ai-config
description: Audit and sync parity between Claude Code and GitHub Copilot AI configuration
argument-hint: '[audit|sync|add <name>|optimize]'
disable-model-invocation: true
---

# Sync AI Configuration

Maintain parity between Claude Code (`.claude/`) and GitHub Copilot (`.github/`) AI configuration.

## Mapping

| Claude Code                 | GitHub Copilot                                | Notes                                           |
| --------------------------- | --------------------------------------------- | ----------------------------------------------- |
| `.claude/rules/<name>.md`   | `.github/instructions/<name>.instructions.md` | Identical content, different frontmatter format |
| `.claude/skills/*/SKILL.md` | `.github/prompts/<name>.prompt.md`            | Equivalent prompt/command definitions           |
| `CLAUDE.md`                 | `.github/copilot-instructions.md`             | Top-level instructions (tool-specific sections) |

`<name>` may include a subdirectory, which must match on both sides (the current rules live in
`code-quality/`). Only the rules/instructions pair currently exists in this repo; the other two rows
apply if and when those files are added.

### Frontmatter Translation

Claude uses `paths` (YAML array), Copilot uses `applyTo` (single string). When Copilot `applyTo` has
comma-separated patterns, split into separate `paths` entries. Both support `description`.

## Commands

### `audit` (default)

Audit parity between both locations:

1. **Rules/Instructions**: Compare `.claude/rules/` and `.github/instructions/`. Report files
   missing from either location (excluding README.md), content body differences, missing parity
   comments.
2. **Skills/Prompts**: Compare `.claude/skills/` dirs and `.github/prompts/` files. Report unpaired
   items. Not all need counterparts.
3. **Top-level**: Compare `CLAUDE.md` and `.github/copilot-instructions.md` for section drift.

Output a summary table with sync status per file pair.

### `sync`

Fix content drift found by audit:

1. Show diff of content bodies (ignoring frontmatter) for each mismatch
2. Ask which version is source of truth per mismatch
3. Update the other file, preserving correct frontmatter format
4. Create missing counterparts with translated frontmatter
5. Ensure all files have parity comments

### `add <name>`

Create a new rule in both locations:

1. Ask for content, glob pattern(s), and description
2. Create `.claude/rules/<name>.md` with `paths` frontmatter
3. Create `.github/instructions/<name>.instructions.md` with `applyTo` frontmatter
4. Add parity comments, identical content body

### `optimize`

Reduce token count of all AI config files while preserving meaning. Apply to both locations.

#### Optimization Principles

These rules apply to all files in `.claude/rules/`, `.github/instructions/`,
`.github/copilot-instructions.md`, and `CLAUDE.md`:

**Writing style:**

- Use terse imperative sentences. Remove filler words and persuasive language.
- BAD: "Always provide the most straightforward and minimalist solution possible. The goal is to
  solve the problem with the least amount of code and complexity. Avoid premature optimization or
  over-engineering."
- GOOD: "Use simplest solution. Minimize code and complexity. No premature optimization."
- Remove "you should", "make sure to", "it is important to", "remember that" — just state the rule.
- Prefer bullet lists over prose paragraphs.

**Code examples:**

- Keep only ONE minimal example per concept. Remove redundant good/bad pairs where the rule is
  already clear from the text.
- Trim examples to the minimum lines that illustrate the point (3-8 lines ideal).
- Remove code examples entirely when the rule is unambiguous without one (e.g., "use `workspace:*`
  for internal packages" needs no 10-line JSON block).
- Keep good/bad pairs ONLY for genuinely confusing patterns where seeing the wrong way prevents real
  mistakes.

**Structure:**

- Remove section headers that contain only one bullet point — inline it into the parent section.
- Collapse single-item subsections into their parent.
- Remove decorative markdown (extra blank lines, horizontal rules, unnecessary emphasis).
- Tables are fine for structured data but not for 2-3 items — use a bullet list instead.

**Content deduplication:**

- Rules in one file (e.g., `code-comments.md`) should NOT repeat content covered by another (e.g.,
  the disable policy in `eslint.md`) or by a top-level instructions file.
- If a rule exists in a scoped file, remove it from the global file. Scoped files are loaded
  alongside global ones.
- Cross-reference instead of repeating: "See architecture rules for error handling" not a full
  restatement.

**What to preserve:**

- All actual rules, constraints, and patterns — never drop a rule to save tokens.
- File paths, command strings, and configuration values — these must be exact.
- Code examples that prevent common mistakes unique to this codebase.
- Structure that aids scanability (headers, bullet lists).

#### Process

1. Read every file, apply principles, rewrite in place
2. Update both locations to maintain parity
3. Report before/after word counts per file and total reduction

## Important Rules

- Never silently overwrite — show diffs and confirm before changing existing files
- Preserve frontmatter format per tool (only content body should match)
- Every paired file must have `<!-- Parity: keep in sync with <path> -->`
- README.md is excluded (no Claude counterpart)
- Naming: Claude uses `<name>.md`, Copilot uses `<name>.instructions.md`
