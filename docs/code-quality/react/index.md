# React

Guides covering the React and Next.js conventions used in this repository.

## Quick Navigation

| I want to...                                  | Go to                                                        |
| --------------------------------------------- | ------------------------------------------------------------ |
| Avoid a data-fetching waterfall               | [Performance → Waterfalls](./performance.md)                 |
| Decide whether to import through a barrel     | [Performance → Bundle Size](./performance.md)                |
| Pass data from a server to a client component | [Performance → Server/Client Boundary](./performance.md)     |
| Render conditionally in JSX                   | [Performance → Re-renders and Rendering](./performance.md)   |
| Decide whether a boolean prop is justified    | [Composition → Booleans](./composition.md)                   |
| Replace a `renderX` prop                      | [Composition → Children Over Render Props](./composition.md) |
| Share state between sibling components        | [Composition → Lift State Into a Provider](./composition.md) |

## Document Overview

### [Performance](./performance.md)

The performance rules that apply to this codebase: eliminating `await` waterfalls, keeping barrel
imports out of client code, dynamically importing heavy client-only components, minimizing what
crosses the server/client boundary, deriving during render instead of in an effect, and using a
ternary rather than `&&` in JSX.

### [Composition](./composition.md)

Designing component APIs that survive growth: boolean props describe state rather than identity,
variants are written out as explicit components, `children` replaces markup-only render props, and
shared state lifts into a provider.

## The Vercel Skills

Both documents are deliberate subsets. The full corpora are Vercel Engineering's agent skills,
vendored into this repository and consulted on demand rather than loaded on every file:

| Skill                         | Contents                                     | Location                                      |
| ----------------------------- | -------------------------------------------- | --------------------------------------------- |
| `vercel-react-best-practices` | 72 performance rules across eight categories | `.claude/skills/vercel-react-best-practices/` |
| `vercel-composition-patterns` | 8 composition and React 19 rules             | `.claude/skills/vercel-composition-patterns/` |

Each skill contains a `SKILL.md` index, per-rule files under `rules/`, and a compiled `AGENTS.md`
holding every rule expanded. They are MIT-licensed and tracked upstream at
[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills); updating means re-copying
the skill directory.

The division of labour is deliberate. A rule loads automatically on every matching file, so it has
to stay small and has to be worth its permanent context cost. A skill is invoked when the task calls
for it, so it can be exhaustive. Anything in the skills that turns out to bite repeatedly here gets
promoted into the rules.

## AI Instructions

The prescriptive counterparts of these conventions live in `.claude/rules/code-quality/react/`
(Claude Code) and `.github/instructions/code-quality/react/` (GitHub Copilot), which are maintained
as parity copies of each other.
