# Self-Improving Skills

A pattern for workflow skills (commit flows, PR flows, generators): after the workflow completes,
evaluate whether the session produced a lesson worth folding back into the skill itself, so
corrections stick instead of recurring.

## Signals

- **The user corrected the output** — edited a draft, overrode a choice, or pushed back on a step.
- **A gate failed in a way the skill did not anticipate** — a hook, linter, or check flagged
  something the skill's instructions should have prevented.
- **The user explicitly says "remember this"** — treat as a strong save signal.

## The Ask

When a signal fires, offer three destinations and let the user pick:

```text
You corrected the [specific thing]. Should I update the [skill-name] skill
(.claude/skills/[skill-name]/SKILL.md) so this lesson sticks?

[y] yes — propose the edit (diff shown before applying)
[n] no — one-off, don't generalize
[m] memory only — save as a personal-memory note instead of changing the skill
```

On `y`: identify the section the lesson belongs in, propose a concrete edit with the diff shown
before applying, and keep the addition tight — one table row or one sentence beats a paragraph.
After applying, say what was added so it can be rolled back if it generalizes poorly. On `m`: save
to persistent memory as `feedback`. On `n`: change nothing.

## Over-Fitting Guard

A single correction is a weak signal. Before proposing an edit, check whether the skill already
encodes the lesson — if so, confirm "I already have a rule for this" instead of duplicating. Prefer
`[m]` when the correction looks situational rather than structural.
