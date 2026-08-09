# Open Questions

Unresolved questions that need discussion before the corresponding backlog items can be finished.

## What are the actual dark-mode color values?

The theming architecture ([theming.md](./theming.md)) makes the dark palette a two-line-per-token
change, but the values themselves are design work that belongs to the rebrand style guide. The dark
values used in the architecture doc's examples are illustrative placeholders, not proposals.

## Do the tokens extend beyond color?

The tokenization step covers colors. A rebrand style guide may also want typography, spacing, and
radius tokens as CSS custom properties. Worth deciding whether to establish those in the same pass
or keep the first pass color-only.

## Where does dark mode land in the rebrand sequencing?

The tokenization and plumbing items can land before any visual rebranding (they are invisible to
users until a dark palette exists and the toggle ships). Should they land early as enabling
infrastructure, or wait until the new light-mode palette is settled so tokens are only authored
once?
