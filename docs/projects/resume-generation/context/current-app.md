# Context Map: Current App (`nick.florin`) Data Layer

_Snapshot taken 2026-08-02. Verify against the code before relying on details._

Next.js 16 (App Router) + React 19 + Prisma 5.22 + Postgres (Vercel) + Clerk auth. Single app, no
monorepo. Path alias `~/` → `src/`.

## Database

- Prisma schema: `src/database/prisma/schema.prisma`; migrations in
  `src/database/prisma/migrations/` (36, ending 2024-10). Postgres via `POSTGRES_PRISMA_URL`
  (pooled) + `POSTGRES_URL_NON_POOLING`.
- Generated client output: `src/database/model/generated/`, post-processed by
  `src/support/patch-generated-client.mjs` (injects `turbopackIgnore` annotations so Turbopack NFT
  tracing doesn't ingest the repo; throws loudly if Prisma output changes shape). Runs on
  `postinstall` and after every generate/migrate.
- `src/database/model/prisma-client.ts` is the **only** module allowed to import from `./generated`;
  new schema enums must be hand-added to its explicit re-exports.
- Client setup (`src/database/prisma/client/`): `ModelMetaDataMiddleware` (enforces `updatedById` on
  updates) + a `$kind` brand extension (adds a discriminator like `'skill'`/`'company'` to every
  result).

### Models (all uuid PKs; all carry createdAt/By + updatedAt/By audit fields → `User`)

| Model                | Essence                                                                                                                                                                                           | Flags                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `User`               | Clerk-backed audit anchor only                                                                                                                                                                    | —                                                     |
| `Profile`            | Single-row "who I am" (name, intro, tagline, contact, github/linkedin URLs)                                                                                                                       | —                                                     |
| `Company` / `School` | Org with logo, location, website; has Experiences / Educations                                                                                                                                    | none (no `visible`!)                                  |
| `Experience`         | Role at a Company: title, dates, skills m2m                                                                                                                                                       | `isCurrent`, `isRemote`, `visible=T`, `highlighted=T` |
| `Education`          | Degree at a School: degree enum, major, dates, skills, courses                                                                                                                                    | `postPoned`, `visible=T`, `highlighted=T`             |
| `Course`             | Belongs to Education; skills m2m                                                                                                                                                                  | `visible=T`                                           |
| `Detail`             | **Polymorphic bullet**: `entityId`+`entityType` (EXPERIENCE\|EDUCATION), **no FK** — orphan risk handled in code. `label`, `description`, `shortDescription`, project link, skills, nestedDetails | `visible=T`                                           |
| `NestedDetail`       | Child of Detail (real FK), same field set                                                                                                                                                         | `visible=T`                                           |
| `Project`            | Named project, slug, startDate, skills/details/repos                                                                                                                                              | `visible=F`, `highlighted=F`                          |
| `Repository`         | GitHub repo by slug, npmPackageName, skills                                                                                                                                                       | `visible=F`, `highlighted=F`                          |
| `Skill`              | Hub model: label/slug, category enums, `experience` (manual) + `calculatedExperience` (derived, persisted)                                                                                        | `visible=T`, `highlighted=F`, `prioritized=F`         |
| `Resume`             | Pointer to an **uploaded** PDF in Vercel Blob — a file record, not structured content                                                                                                             | `primary`                                             |

`Detail`/`NestedDetail` are the models that resume-gen's `ContentNode`/`NestedContentNode` are
designed to replace (see [resume-gen.md](./resume-gen.md) and resume-gen's `docs/content-model.md`
migration table: `label`→`title`, `description`→`content`, `entityId/entityType`→
`ownerId/ownerType`, `detailId`→`parentId`).

## Fixtures & Seeding (prior art for fixture ⇄ DB sync)

- `src/database/fixtures/` — Zod schemas per model, `jsonifiers.ts` (DB → JSON), `util.ts`
  (`cleanModel` strips ids/FKs), JSON in `json/` (live) with a `json/fake/` dev mirror.
- Only 6 fixture files cover 12 models via nesting: `skills.json` (149), `companies.json` (10, with
  nested experiences → details → nestedDetails), `schools.json` (2, nested educations →
  courses/details), `projects.json` (4), `repositories.json` (22), `profiles.json` (1). Relations
  are expressed as **slug references**, resolved fuzzily at seed time (`src/scripts/seed/util.ts`).
  `Resume` has no fixture (seeded from blob storage listing).
- **DB → JSON**: `src/scripts/jsonify/index.ts`; only `fixtures:jsonify:prod` is wired up in
  package.json (`--live=true` + Prettier). No dev-DB jsonify script exists — a gap.
- **JSON → DB**: `prisma db seed` → `src/scripts/seed/index.ts`; one transaction, strict order
  (profile → resumes → skills → repositories → projects → schools → companies →
  calculate-skill-experiences). Seed assumes an **empty DB** (run via `pnpm prisma:migrate:reset`).
  Seed-repositories fetches live GitHub first and diffs against fixtures.
- So today's "sync" is one-directional-pair: full dump (jsonify) / full reload (reset+seed). The
  project's bidirectional incremental sync requirement is a generalization of this pair.

## Integrations

- **GitHub only.** `src/integrations/github/client.ts` — unauthenticated fetch of
  `users/{GITHUB_USERNAME}/repos`; `syncRepositories` creates missing `Repository` rows
  (`visible:false`), never updates existing ones. Consumers: `pnpm repositories:sync[-prod]` script,
  an admin server action, and the seed step.
- **No LinkedIn integration exists** — `linkedinUrl` is just a string on `Profile`.
- Generic `HttpClient` exists at `src/integrations/http/` but the GitHub client doesn't use it.

## App Structure (high level)

- `src/app/resume/` — public website resume view (experience/education timelines). Not a document
  generator.
- `src/app/projects/`, `src/app/dashboard/` (parallel slots) — public pages.
- `src/app/admin/` — the CMS: six sections (skills/experiences/educations/courses/projects/
  repositories), protected by Clerk middleware in `src/proxy.ts`. **Stays on old models the
  longest.**
- `src/app/api/` — REST route handlers per model; `src/actions/` — server actions per operation with
  shared fetch/mutation infra (SuperJSON, `ActionVisibility = 'admin' | 'public'`); `src/features/`
  — per-domain UI; `src/hooks/api/` — SWR wrappers.
- **No PDF/HTML resume generation code exists in this repo** (no puppeteer/react-pdf/etc.). Resume
  PDFs are manually uploaded to Vercel Blob via the admin UI (`Resume` model).

## Environment / dev-vs-prod DB

- `.env` is always written by `vercel env pull` and always holds **production** Postgres params
  (single-DB Vercel plan). Committed `.env.development` overrides `POSTGRES_*` with local values —
  that override is the only thing keeping dev off the prod DB.
- Every DB script has a dev variant (via `env:setup:dev`) and a `:prod` variant. CLI scripts run
  through `src/scripts/cli/` harness which hard-fails on a prod-DB + test-Clerk-key mismatch.
- `src/environment/index.ts` Zod-validates all env vars per environment name ({test, local, preview,
  production}).

## Friction Points Relevant to the Re-Modeling

1. `Detail.entityId`/`entityType` polymorphism has no FK — orphan detection lives in jsonifiers and
   seed code. (resume-gen's model keeps the polymorphism on `ContentNode` but is a chance to
   revisit.)
2. Visibility is one boolean per model, with `highlighted`/`prioritized` as ad-hoc proxies — no
   per-medium flags anywhere. This is the core gap; resume-gen's `Syndicated` (`visible` +
   `excludedChannels[]`) is the designed replacement.
3. Inconsistent visibility defaults: `Company`/`School` have no flag at all; `Project`/`Repository`
   default hidden; the rest default visible.
4. Fixtures don't cover all models independently; `Detail`/`Experience`/`Education`/`Course` exist
   only nested; `Resume` not at all.
5. `Skill.calculatedExperience` is a persisted derived column needing post-seed recalculation
   (`src/database/model/skill-experience.ts`, `pnpm experience:calculate`).
6. `prisma-client.ts` needs manual edits for every new enum; `patch-generated-client.mjs` must keep
   working after any Prisma schema/codegen change — both are taxes on schema evolution.
