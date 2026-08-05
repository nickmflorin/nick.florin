---
paths:
  - '**/*.{ts,tsx}'
description:
  'React and Next.js performance rules that apply to this codebase: waterfalls, bundle size, the
  server/client boundary, and re-renders'
---

<!-- Parity: keep in sync with .github/instructions/code-quality/react/performance.instructions.md -->

# React & Next.js Performance

## Scope

This file carries only the performance rules that bite in **this** codebase, so that it is small
enough to load on every React file. It is a subset, not the whole subject.

The full corpus — 72 rules across eight categories, maintained by Vercel Engineering — is installed
as the `vercel-react-best-practices` skill. Invoke that skill for any dedicated performance task:
profiling a slow route, auditing bundle size, or reviewing a component for wasted renders. The rules
below are the ones that must be applied without being asked.

Each rule is tagged with the impact tier it carries in that corpus.

## Eliminating Waterfalls — CRITICAL

Sequential awaits are the largest single source of avoidable latency, because each one pays a full
round trip before the next begins.

### Await Independent Work in Parallel

```typescript
// Disallowed: `fetchSkills` does not start until `fetchExperiences` resolves. The route pays both
// latencies end to end.
const experiences = await fetchExperiences({ visibility });
const skills = await fetchSkills({ visibility });

// Correct: both requests are in flight at once, so the route pays the slower of the two.
const [experiences, skills] = await Promise.all([
  fetchExperiences({ visibility }),
  fetchSkills({ visibility }),
]);
```

This applies to parallel route slots too. `@table` and `@pagination` render concurrently, so each
slot must not re-await work the other already has — hoist a shared fetch or wrap it in `cache()`
rather than serializing them.

### Start the Promise Early, Await It Late

When a value is needed only on one branch, start the request before the branch and await it inside:

```typescript
// Disallowed: every caller pays for the details fetch, including the ones that return early.
const details = await fetchDetails(experienceId);
if (!isVisible) {
  return null;
}
return render(details);

// Correct: the request starts immediately but is only awaited where it is used.
const detailsPromise = fetchDetails(experienceId);
if (!isVisible) {
  return null;
}
return render(await detailsPromise);
```

### Check Cheap Synchronous Conditions First

A synchronous guard that can short-circuit belongs above the `await`, never below it.

```typescript
// Disallowed: the round trip happens even when `id` is absent.
const record = await fetchExperience(id);
if (!id) {
  return null;
}

// Correct.
if (!id) {
  return null;
}
const record = await fetchExperience(id);
```

## Bundle Size — CRITICAL

### Import Concrete Modules in Client Code, Never Barrels

A barrel import makes every module the barrel re-exports part of the client's module graph. Server
code is exempt because none of it reaches the browser. This is the same rule stated from the naming
side in `file-naming.md`, in this same `code-quality/` directory.

```tsx
'use client';

// Disallowed: `~/components/icons/index.ts` re-exports every icon module, and all of them enter
// the bundle to obtain one.
import { Icon } from '~/components/icons';

// Correct.
import { Icon } from '~/components/icons/Icon';
```

### Dynamically Import Heavy Client-Only Components

Charts, editors, drawers, and dialogs are frequently below the fold or behind an interaction. They
belong behind `next/dynamic` so their cost is paid on use rather than on load.

```tsx
// Disallowed: the Nivo bundle is in the initial payload even when the chart is never scrolled to.
import { SkillsBarChart } from '~/components/charts/SkillsBarChart';

// Correct: loaded on render, and never included in the server bundle.
const SkillsBarChart = dynamic(
  () => import('~/components/charts/SkillsBarChart').then(m => m.SkillsBarChart),
  { loading: () => <ChartSkeleton />, ssr: false },
);
```

Use `ssr: false` only for components that genuinely cannot render on the server. It suppresses
server rendering, which costs first paint if the component is above the fold.

### `dynamic()` Never Appears in a Server Component

A client component imported by a server component is already code-split per route, so `dynamic()`
adds nothing there — and it breaks hydration. In a server component, `dynamic()` wraps the target in
a Suspense layer whose boundary markers are written into the server HTML; the client resolves the
module synchronously, renders no boundary, and every sibling that follows shifts position.

```tsx
// Disallowed: the server HTML carries a Suspense boundary the client never renders, and
// hydration fails at the sibling that follows.
const Tour = dynamic(() => import('~/components/tours/Tour').then(mod => mod.Tour));

// Correct: a static import of a client component is code-split per route by the framework.
import { Tour } from '~/components/tours/Tour';
```

The failure is visible in the hydration error's diff as a boundary only one side rendered:

```text
<Content>
+  <div className="content overflow-y-auto">
-  <Suspense>
```

`dynamic()` belongs inside client components only — the charts, drawers, and dialogs above — where
it performs real intra-route splitting.

## The Server/Client Boundary — HIGH

### Serialize the Minimum

Every prop crossing from a server component into a client component is serialized into the RSC
payload and shipped over the wire. Passing a whole model to a component that reads two fields makes
the user download the rest.

```tsx
// Disallowed: the full record, including fields the tile never reads, is serialized.
<SkillTile skill={skill} />

// Correct: only what the component uses crosses the boundary.
<SkillTile id={skill.id} label={skill.label} experience={skill.experience} />
```

The same applies in reverse: do not serialize the same object into two sibling client components
when one shared parent could receive it once.

### Fetch on the Server; Use SWR on the Client

Data needed to render belongs in a server component via a server action from `~/actions/`. Data
fetched in response to interaction belongs in SWR through `~/api/client.ts`, which deduplicates
concurrent requests for the same key. Hand-rolling `fetch` inside a `useEffect` is disallowed — it
forfeits deduplication, caching, and revalidation, and it guarantees a client-side waterfall after
hydration.

## Re-renders — MEDIUM

### Derive During Render, Never in an Effect

A value computable from props or state is computed during render. Putting it in state and syncing it
with an effect costs a second render pass and lets the two drift apart.

```tsx
// Disallowed: renders once with the stale value, then again after the effect runs.
const [visibleSkills, setVisibleSkills] = useState<Skill[]>([]);
useEffect(() => {
  setVisibleSkills(skills.filter(s => s.visible));
}, [skills]);

// Correct: one render, and the value cannot go stale.
const visibleSkills = useMemo(() => skills.filter(s => s.visible), [skills]);
```

Reach for `useMemo` only when the computation is actually expensive; a cheap expression is computed
inline without memoization.

### Never Define a Component Inside a Component

A component declared in another component's body is a new type on every render, so React unmounts
the old tree and mounts a new one — losing all state and DOM within it.

```tsx
// Disallowed: `Row` is a different component every render, so each row remounts and any focus or
// input state inside it is destroyed.
const SkillsTable = ({ skills }: SkillsTableProps) => {
  const Row = ({ skill }: RowProps) => <tr>{skill.label}</tr>;
  return (
    <tbody>
      {skills.map(s => (
        <Row key={s.id} skill={s} />
      ))}
    </tbody>
  );
};

// Correct: declared once, at module scope, in its own file.
const SkillsTableRow = ({ skill }: SkillsTableRowProps) => <tr>{skill.label}</tr>;
```

The file-naming rule already requires one component per PascalCase file, which forecloses this by
construction.

## Rendering — MEDIUM

### Conditional Rendering Uses a Ternary, Never `&&`

With `&&`, a falsy left operand that is not a boolean renders **itself**. A `0` count renders the
literal `0`; an empty string renders nothing but still evaluates.

```tsx
// Disallowed: when `skills.length` is 0, React renders the literal "0" into the document.
const SkillsPanel = ({ skills }: SkillsPanelProps): JSX.Element => (
  <section>{skills.length && <SkillsList skills={skills} />}</section>
);

// Correct: the condition is a boolean, and the empty case is stated explicitly.
const SkillsPanel = ({ skills }: SkillsPanelProps): JSX.Element => (
  <section>{skills.length > 0 ? <SkillsList skills={skills} /> : null}</section>
);
```

`react/jsx-no-leaked-render` enforces this, configured with `validStrategies: ['ternary']`. It is a
**grandfathered** rule: it carries `GrandfatheredSeverity` (`warn`) because components across the
codebase still render with `&&`, and it is promoted to `error` once they are migrated. Grandfathered
does not mean optional — new and modified code satisfies it as though it were an error, and a
violation reported on a component already being edited is fixed as part of that change. The full
contract is in the ESLint rule in the parent `code-quality/` directory (`eslint.md` for Claude Code,
`eslint.instructions.md` for Copilot).

## Already Enforced by the Linter

These do not need restating in review; the configuration in
`tooling/eslint-config-web/configs/react.mjs` rejects them outright:

| Concern                           | Rule                                | Level                |
| --------------------------------- | ----------------------------------- | -------------------- |
| `forwardRef` in React 19          | `@eslint-react/no-forward-ref`      | error                |
| `useContext` over `use()`         | `@eslint-react/no-use-context`      | error                |
| `Context.Provider` over `Context` | `@eslint-react/no-context-provider` | error                |
| Incorrect effect dependencies     | `@eslint-react/exhaustive-deps`     | error                |
| Two components in one file        | `react/no-multi-comp`               | error                |
| `&&` in JSX                       | `react/jsx-no-leaked-render`        | warn (grandfathered) |

## Applying the Convention

These rules govern new components and deliberate restructures. Parts of the codebase predate them;
do not sweep the repository converting existing code as a side effect of unrelated work. When a
component or route is already being added, moved, or rewritten, bring it into conformance as part of
that change.

For anything beyond this subset — waterfall analysis, bundle audits, caching strategy, JavaScript
hot paths — invoke the `vercel-react-best-practices` skill rather than guessing.
