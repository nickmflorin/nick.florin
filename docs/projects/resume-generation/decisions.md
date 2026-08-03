# Decision Log

Every non-trivial decision made on this project gets an entry here, newest first. Each entry records
the decision, the date, the reasoning, and any alternatives that were rejected. This is the file to
consult before re-opening a settled question.

Format:

```
## YYYY-MM-DD — Short decision title

**Decision:** What was decided.
**Why:** The reasoning.
**Alternatives considered:** What was rejected and why (omit if none).
```

---

## 2026-08-03 — Resume generation lives in this app; no monorepo

**Decision:** Resume generation is ported into this Next.js app as a self-contained feature area. No
monorepo, no shared package, no separate generator app. The renderer is React (Server Components);
`~/repos/resume-gen` stays untouched as the working reference until the in-app version reaches
parity, then retires. Its content is frozen once the in-app renderer starts, so parity has a fixed
target. PDF generation v1 is a local script (headless browser printing the served sheet routes,
TS-native merge); the deployed on-demand route comes later once content is DB-backed.

**Why:** The end state requires generation from the live database on demand, which a static Astro
app cannot do. The port is near-mechanical (resume-gen's model layer has zero Astro imports; its
components have no client JS). A monorepo's shared-package benefit is temporary — it evaporates when
the Astro app retires — while converting this repo's single-package tooling (client patching, ESLint
tooling, env layering, Vercel config) to workspaces is a large diversion.

**Alternatives considered:** Turborepo monorepo with a shared content package (rejected: temporary
benefit, high conversion cost); keeping resume-gen as a separately deployed SSR app (rejected:
recreates two sources of truth). Would revisit monorepo only if the generator becomes an
independently deployable product.

## 2026-08-03 — Document routes: `/documents/resume`, separate root layout, auth-gated, UI in `src/documents/`

**Decision:** The print-form resume lives at `/documents/resume` (stacked browsing view) and
`/documents/resume/[sheet]` (per-sheet printable pages), inside a `(document)` route group with its
own bare root layout — all existing routes moved into a `(site)` route group (URLs unchanged). The
document layout imports only `src/styles/document/index.scss`; site styles enter via `AppConfig` in
the site layout, so isolation is structural in both directions. The routes are protected in
`src/proxy.ts` by the same Clerk admin matcher as `/admin` (auth-only — no environment gating, so
the routes are deployable for the future on-demand PDF feature). Document UI components live in a
dedicated `src/documents/` folder (e.g. `src/documents/resume/`), not under `src/features/`.

**Why:** CSS imported in a root layout only loads for routes under it, which gives complete two-way
style isolation without hacks — required for print fidelity. `/documents/...` was chosen over
`/resume-doc` to namespace future document types, and because sharing the existing `/resume` segment
across two root layouts invites route-resolution conflicts. Auth-gating (rather than dev-only) keeps
the live-preview iteration loop in dev while leaving the routes deployable.

**Decision:** The new parallel models are named as follows: the successor to `Skill` is
**`Competency`** (plural "competencies" — from here on, project discussion says "competencies", not
"skills", when referring to the new modeling); the successor to `Experience` is **`Role`**; the
successor to `Education` is **`Degree`**.

**Why:** The old and new models must coexist during the parallel period, so the new names cannot
collide with existing Prisma models. `Competency` reads naturally in schema and prose, collides with
nothing in either repo, and is semantically broader than `Skill`, fitting the added configurability.
`Role` and `Degree` are already the names of resume-gen's presentation types, so this aligns the two
vocabularies.

**Alternatives considered:** `Capability` (overloaded in software contexts) and `Expertise` (awkward
as a countable row) for the `Skill` successor; `Proficiency` was unavailable — resume-gen already
uses it for the familiarity-bucket enum (`FAMILIAR | PROFICIENT | ADVANCED | EXPERT`).

## 2026-08-02 — Schema/implementation work deferred until research phase concludes

**Decision:** No new Prisma models or implementation work yet, even though resume-gen's
`docs/content-model.md` contains a paste-ready target schema. Research and discussion items (repo
structure, Astro vs. React, PDF pipeline, `Detail.shortDescription`, sync design, LinkedIn
feasibility) are tracked as first-class tasks in the Research & Discussion section of
[backlog.md](./backlog.md) and are worked first: research → written recommendation → discussion with
Nick → decision recorded here. Nothing is decided unilaterally.

**Why:** We are laying groundwork. Several of the open questions (notably repo structure and
`Detail.shortDescription`) change the shape of the schema and the codebase layout; implementing
before they are settled would bake in guesses.

## 2026-08-02 — Project context lives in `docs/projects/resume-generation/`

**Decision:** All persistent working context for this project (status, decisions, codebase maps,
open questions) lives in this repo under `docs/projects/resume-generation/`, committed to git.
(Originally created as a top-level `resume-generation-project/` folder, moved under `docs/projects/`
the same day.)

**Why:** The project spans many sessions over a long period. Context in the repo is versioned,
visible to both the developer and AI sessions, and survives any single conversation. Living under
`docs/` keeps it alongside the repo's other human-readable documentation.
