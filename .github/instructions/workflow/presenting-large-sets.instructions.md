---
applyTo: '**'
description:
  'When presenting many decision-inviting items, offer all-at-once vs. a step-by-step guided walkthrough first'
---

<!-- Parity: keep in sync with .claude/rules/workflow/presenting-large-sets.md -->

# Presenting Large Sets of Items

## The Rule

When a response would present the developer with a large set of discrete items — open questions,
decisions to make, review findings, options to weigh, backlog recaps, or any similarly long
enumeration — do **not** dump the full set by default. First ask which mode they want:

1. **All at once** — the complete set in one message, organized for scanning.
2. **Step by step** — a guided walkthrough, one item at a time, gathering their input or answer at
   each stop before moving to the next.

Ask via `AskUserQuestion` when it is available, otherwise as a plain question. A useful threshold:
five or more items that each invite a reaction, or an enumeration long enough that the developer
would have to scroll to see it all. Below that, just present the content — asking would be
ceremony.

## The Walkthrough Protocol

When the developer chooses step by step:

- Present **one item per turn**: what it is, the minimum context needed to react to it, and a
  concrete question or recommendation — never "any thoughts?".
- Wait for the answer, apply or record it (update the relevant project docs as decisions land,
  per the project's update-as-you-go convention), and only then advance to the next item.
- Keep a visible sense of position ("3 of 9"), and keep a running tally of what has been decided
  so far.
- Skipping, reordering, or stopping early is the developer's call; offer it when an item is
  clearly not ready to be decided.
- At the end, summarize every outcome in one message — what was decided, what was deferred, and
  what the decisions unlocked.

## Example

```text
Correct:
  "There are 11 open questions across modeling and sync. Want them all on screen at once, or
   should we walk through them one at a time and settle each as we go?"

Disallowed (the default this rule exists to prevent):
  [3,000 words enumerating all 11 questions, each needing a decision, in a single message]
```

## Why

A long enumeration where every item needs a reaction is a worst case for reading in a terminal:
the developer either loses their place responding to item 3 of 11, or answers none of them. The
step-by-step mode turns the same content into a sequence of small decisions that actually get
made. The choice belongs to the developer because the right mode depends on what they want to do
with the content — scan it, or work it.
