---
paths:
  - 'src/**'
  - 'tooling/**'
description:
  'Blast-radius assessment, pattern mining, and escalation thresholds for AI-driven code changes'
---

<!-- Parity: keep in sync with .github/instructions/workflow/agent-behavior.instructions.md -->

# Agent Behavior

How AI coding agents approach changes in this repository. Complements
[discovery.md](../discovery.md), which covers search delegation.

## Blast Radius Assessment

Before modifying a file, assess its impact. When changing a function signature, type, or return
value, find the call sites first. Shared modules are high-risk — `src/lib/`, `src/hooks/`,
`src/components/`, `src/actions/types/`, `src/database/model/`, and `src/integrations/` are imported
broadly, and changes there ripple.

```bash
# Before editing a shared module, check who imports it (imports use the ~/ alias).
grep -r "from '~/lib/ordering'" src --include='*.ts*' -l
```

| Importer Count | Action                                             |
| -------------- | -------------------------------------------------- |
| 0-2            | Proceed normally                                   |
| 3-5            | Review each consumer to confirm compatibility      |
| 6+             | Present the change plan to the user before editing |

## Pattern Mining

When implementing something that has been done before (a new admin resource, a new server action
domain, a new API route), find the **most recent real example** and mirror it — the
[codebase index](../codebase-index.md) names a reference example for each placement convention.

```bash
# Find the most recently added example of the pattern.
git log --oneline -10 --diff-filter=A -- 'src/actions/*/create-*.ts'
```

Read the actual implementation, not just the convention docs. Convention docs describe the ideal;
real code shows the current state. When they conflict, match the real code and flag the discrepancy
to the user.

## Escalation Protocol

Stop and ask instead of guessing at these thresholds:

| Situation                                                   | Action                                     |
| ----------------------------------------------------------- | ------------------------------------------ |
| Task requires modifying >5 files                            | Present a plan before starting             |
| A test fails twice with different approaches                | Ask — the requirement may be misunderstood |
| About to delete >20 lines of code                           | Confirm the deletion is intended           |
| Unsure which of 2+ valid approaches to take                 | Present options with tradeoffs             |
| Modifying shared infrastructure (Prisma schema, auth, HTTP) | Confirm scope before proceeding            |
| Build/typecheck fails and the fix isn't obvious             | Ask rather than making speculative changes |

When multiple approaches are valid, present them rather than silently picking one:

```text
Disallowed — silently picking an approach when multiple are valid:
"I'll store the filter state in localStorage." (without asking)

Correct — present the options with tradeoffs:
"Filter state can live in the URL search params (shareable, survives refresh, matches the admin
tables) or in localStorage (persists across sessions, invisible to links). Which fits here?"
```
