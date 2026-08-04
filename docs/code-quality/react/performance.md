# React & Next.js Performance

The performance conventions that apply to this codebase — a deliberately small subset, kept small so
it can be loaded on every React file.

## Why a Subset

The full corpus is Vercel Engineering's React best-practices guide: 72 rules across eight
categories, prioritized by impact. It is installed at
[.claude/skills/vercel-react-best-practices/](../../../.claude/skills/vercel-react-best-practices/)
and is consulted on demand — for profiling a slow route, auditing bundle size, or reviewing a
component for wasted renders.

Only the rules that actually bite here are promoted into
[.claude/rules/code-quality/react/performance.md](../../../.claude/rules/code-quality/react/performance.md),
because rules load automatically and always-on context is a budget. Everything else stays in the
skill, one invocation away.

## Waterfalls Are the Expensive Mistake

Each sequential `await` pays a full round trip before the next begins, so two independent fetches
written one after the other cost their sum rather than their maximum:

```typescript
// Disallowed: `fetchSkills` does not start until `fetchExperiences` resolves.
const experiences = await fetchExperiences({ visibility });
const skills = await fetchSkills({ visibility });

// Correct: both are in flight at once, so the route pays the slower of the two.
const [experiences, skills] = await Promise.all([
  fetchExperiences({ visibility }),
  fetchSkills({ visibility }),
]);
```

Two related habits follow from the same reasoning. A promise needed on only one branch is started
before the branch and awaited inside it, so callers that return early pay nothing. And a cheap
synchronous guard always sits above the `await`, never below it — checking `if (!id)` after
`await fetchExperience(id)` pays for a request whose result is discarded.

This matters especially in the admin routes, where `@table` and `@pagination` render as concurrent
parallel-route slots. Neither slot should re-await work the other already has.

## Bundle Size

Two rules carry nearly all the weight.

**Client code imports concrete modules, not barrels.** A barrel import pulls every module the barrel
re-exports into the client's module graph. Server code is exempt, since none of it reaches the
browser — the full statement of that split lives in
[File & Folder Naming](../best-practices.md#file--folder-naming) and in the file-naming rule.

```tsx
'use client';

// Disallowed: every icon module enters the bundle to obtain one.
import { Icon } from '~/components/icons';

// Correct.
import { Icon } from '~/components/icons/Icon';
```

**Heavy client-only components load dynamically.** Charts, editors, drawers, and dialogs are usually
below the fold or behind an interaction, so their cost belongs on use rather than on load:

```tsx
const SkillsBarChart = dynamic(
  () => import('~/components/charts/SkillsBarChart').then(m => m.SkillsBarChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);
```

`ssr: false` is reserved for components that genuinely cannot render on the server — it costs first
paint for anything above the fold.

## The Server/Client Boundary

Every prop crossing from a server component into a client component is serialized into the RSC
payload and downloaded by the user. Passing a whole model to a component that reads two fields ships
the rest for nothing:

```tsx
// Disallowed: the full record is serialized, including fields the tile never reads.
<SkillTile skill={skill} />

// Correct.
<SkillTile id={skill.id} label={skill.label} experience={skill.experience} />
```

Data needed to render belongs on the server, fetched through `~/actions/`. Data fetched in response
to interaction belongs in SWR through `~/api/client.ts`, which deduplicates concurrent requests for
the same key. A hand-rolled `fetch` inside a `useEffect` forfeits deduplication, caching, and
revalidation, and guarantees a client-side waterfall after hydration.

## Re-renders and Rendering

Derive during render rather than syncing with an effect — an effect costs a second render pass and
lets the two values drift:

```tsx
// Disallowed: renders once with the stale value, then again after the effect runs.
const [visibleSkills, setVisibleSkills] = useState<Skill[]>([]);
useEffect(() => {
  setVisibleSkills(skills.filter(s => s.visible));
}, [skills]);

// Correct.
const visibleSkills = useMemo(() => skills.filter(s => s.visible), [skills]);
```

Never define a component inside another component: it is a new type on every render, so React
unmounts and remounts the whole subtree, destroying its state. The one-component-per-file naming
rule already forecloses this.

Conditional rendering uses a ternary rather than `&&`, because a falsy non-boolean left operand
renders itself — a `0` count renders a literal `0` into the document:

```tsx
// Disallowed.
<section>{skills.length && <SkillsList skills={skills} />}</section>

// Correct.
<section>{skills.length > 0 ? <SkillsList skills={skills} /> : null}</section>
```

This one is enforced by `react/jsx-no-leaked-render` with `validStrategies: ['ternary']`. It is a
_grandfathered_ rule — it carries the shared `GrandfatheredSeverity` constant rather than a bare
`'warn'`, because components across the codebase still render with `&&`. The severity keeps an
existing backlog from failing CI; it does not make the rule optional. New and modified code
satisfies it as though it were an error, a violation on a component already being edited is fixed as
part of that change, and the rule is promoted to `error` once the last `&&` render is gone.

Because `pnpm lint:errors` suppresses warnings, a grandfathered warning is invisible in CI. That
makes it the developer's and the agent's job to notice, which is the whole reason the intent is
named in the configuration rather than left as an unexplained `'warn'`.

## Reference

The prescriptive counterpart lives in `.claude/rules/code-quality/react/performance.md` and
`.github/instructions/code-quality/react/performance.instructions.md`. The full 72-rule corpus is
the `vercel-react-best-practices` skill.
