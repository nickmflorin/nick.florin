<!-- Parity: keep in sync with .github/instructions/codebase-index.instructions.md -->

# Codebase Index

Check this index BEFORE using Grep/Glob. Go directly to listed files. Only fall back to searching if
the index doesn't cover what you need.

This is a single Next.js 16 App Router application (not a monorepo): React 19, Prisma + PostgreSQL,
Clerk auth, Tailwind + Sass, Mantine, SWR, pnpm. The path alias `~/*` maps to `src/*`.

## Route Map

All routes live in `src/app/` under two route groups: `(site)` (main app) and `(document)` (resume
document rendering).

### Site Routes (`src/app/(site)/`)

| Route                            | Page File                                | Notes                         |
| -------------------------------- | ---------------------------------------- | ----------------------------- |
| `/`                              | `page.ts`                                | Redirects to `/dashboard`     |
| `/dashboard`                     | `dashboard/layout.tsx`                   | Parallel routes — see below   |
| `/resume/experience`             | `resume/experience/page.tsx`             | `/resume` redirects here      |
| `/resume/education`              | `resume/education/page.tsx`              |                               |
| `/projects/greenbudget`          | `projects/greenbudget/page.tsx`          | `/projects` redirects here    |
| `/projects/tooltrack`            | `projects/tooltrack/page.tsx`            |                               |
| `/projects/website`              | `projects/website/page.tsx`              |                               |
| `/projects/asset-visualizations` | `projects/asset-visualizations/page.tsx` |                               |
| `/sign-in`                       | `sign-in/[[...sign-in]]/page.tsx`        | Clerk catch-all sign-in route |

### Dashboard Parallel Routes (`src/app/(site)/dashboard/`)

The dashboard layout composes five parallel route slots: `@chart`, `@projects`, `@experiences`,
`@educations`, `@repositories` — each with its own `page.tsx`.

### Admin Routes (`src/app/(site)/admin/`)

`/admin` redirects to `/admin/skills`. Every admin resource follows the same parallel-route pattern:
a `layout.tsx` composing three slots — `@title`, `@table`, `@pagination` — each slot containing
`page.tsx`, `default.ts`, `error.tsx`, and (for `@title`/`@table`) `loading.tsx`.

| Route                 | Directory             | Resource-Specific Components                               |
| --------------------- | --------------------- | ---------------------------------------------------------- |
| `/admin/skills`       | `admin/skills/`       | `@table/SkillsTableBody.tsx`                               |
| `/admin/projects`     | `admin/projects/`     | `@table/ProjectsTableBody.tsx`                             |
| `/admin/experiences`  | `admin/experiences/`  | `@table/ExperiencesTableBody.tsx`                          |
| `/admin/educations`   | `admin/educations/`   | `@table/EducationsTableBody.tsx`                           |
| `/admin/courses`      | `admin/courses/`      | `@table/CoursesTableBody.tsx`, `CoursesTableFilterBar.tsx` |
| `/admin/repositories` | `admin/repositories/` | `@table/RepositoriesTableBody.tsx`                         |

### Document Routes (`src/app/(document)/`)

| Route                       | Page File                           | Notes                              |
| --------------------------- | ----------------------------------- | ---------------------------------- |
| `/documents/resume`         | `documents/resume/page.tsx`         | Resume document view               |
| `/documents/resume/[sheet]` | `documents/resume/[sheet]/page.tsx` | Dynamic per-sheet resume rendering |

## API Route Map

All under `src/app/api/{resource}/`. The standard pattern is `route.ts` (list) + `[id]/route.ts`
(detail).

| Resource       | Routes                                               |
| -------------- | ---------------------------------------------------- |
| skills         | `route.ts`, `[id]/route.ts`                          |
| projects       | `route.ts`, `[id]/route.ts`                          |
| experiences    | `route.ts`, `[id]/route.ts`, `[id]/details/route.ts` |
| educations     | `route.ts`, `[id]/route.ts`, `[id]/details/route.ts` |
| courses        | `route.ts`, `[id]/route.ts`                          |
| repositories   | `route.ts`, `[id]/route.ts`                          |
| companies      | `route.ts`, `[id]/route.ts`                          |
| schools        | `route.ts`, `[id]/route.ts`                          |
| resumes        | `route.ts` (list only)                               |
| details        | `[id]/route.ts`                                      |
| nested-details | `[id]/route.ts`                                      |

## Server Actions Map (`src/actions/`)

Mutations and server-side fetches are server actions, organized per domain in
`src/actions/{domain}/` with `verb-noun.ts` naming (e.g. `create-skill.ts`, `fetch-skills.ts`,
`hide-projects.ts`).

| Directory                | Contents                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `skills/`                | CRUD + fetch + visibility (show/hide) + highlight + prioritize actions              |
| `projects/`              | CRUD + fetch + visibility + highlight actions                                       |
| `experiences/`           | CRUD + fetch + visibility + highlight actions                                       |
| `educations/`            | CRUD + fetch + visibility + highlight actions                                       |
| `courses/`               | CRUD + fetch actions                                                                |
| `repositories/`          | CRUD + fetch + visibility actions                                                   |
| `companies/`, `schools/` | CRUD only (no visibility toggles)                                                   |
| `resumes/`               | `fetch-resumes.ts`, `upload-resume.ts`, `delete-resume.ts`, `set-primary-resume.ts` |
| `details/`               | Detail/nested-detail management for experiences and educations                      |
| `types/`                 | Per-domain action types + `search.ts`, `controls.ts`                                |

Shared top-level modules: `fetches.ts`, `mutations.ts`, `get-entity.ts`, `get-profile.ts`,
`m2ms.ts`, `visibility.ts`, `pagination.ts`, `schemas.ts`.

## Domain Map

| Domain       | Admin Route           | API                 | Actions                 | Feature Components                                     | Prisma Model             |
| ------------ | --------------------- | ------------------- | ----------------------- | ------------------------------------------------------ | ------------------------ |
| Skills       | `/admin/skills`       | `api/skills/`       | `actions/skills/`       | `features/skills/`                                     | `Skill`                  |
| Projects     | `/admin/projects`     | `api/projects/`     | `actions/projects/`     | `features/projects/` (ProjectTile, Section, Series, …) | `Project`                |
| Experiences  | `/admin/experiences`  | `api/experiences/`  | `actions/experiences/`  | `features/experiences/` (ExperienceTimeline)           | `Experience`             |
| Educations   | `/admin/educations`   | `api/educations/`   | `actions/educations/`   | `features/educations/` (EducationTimeline)             | `Education`              |
| Courses      | `/admin/courses`      | `api/courses/`      | `actions/courses/`      | `features/courses/` (HumanizedCourses)                 | `Course`                 |
| Repositories | `/admin/repositories` | `api/repositories/` | `actions/repositories/` | `features/repositories/` (RepositoryTile)              | `Repository`             |
| Companies    | — (API only)          | `api/companies/`    | `actions/companies/`    | `features/companies/`                                  | `Company`                |
| Schools      | — (API only)          | `api/schools/`      | `actions/schools/`      | `features/schools/`                                    | `School`                 |
| Resumes      | `/documents/resume`   | `api/resumes/`      | `actions/resumes/`      | `features/resume/` (DetailsTimeline, UploadResumeMenu) | `Resume`                 |
| Details      | — (nested)            | `api/details/`      | `actions/details/`      | —                                                      | `Detail`, `NestedDetail` |
| Site/Profile | —                     | —                   | `get-profile.ts`        | `features/site/` (UserProfile, SiteNavMenu)            | `User`, `Profile`        |

## Directory Map (`src/`)

| Directory       | Purpose                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------- |
| `app/`          | App Router routes (see Route Map)                                                            |
| `actions/`      | Server actions — all mutations and server-side fetches                                       |
| `api/`          | Client-side API utilities: `client.ts`, `serialization.ts`, `errors/`                        |
| `application/`  | App-level concerns: `auth/` (Clerk server auth, roles), `errors/`, `pages/`                  |
| `components/`   | Generic UI components by category (see Components below)                                     |
| `database/`     | Prisma schema, client, model wrappers, fixtures (see Data Layer below)                       |
| `documents/`    | Resume document generation utilities                                                         |
| `environment/`  | Typed environment configuration (`next-environment.ts`, `node-environment.ts`)               |
| `features/`     | Domain feature modules: `{domain}/types`, `{domain}/components/`                             |
| `hooks/`        | Custom React hooks (`use-filters.ts`, `use-navigation.ts`, `use-ordering.ts`, …)             |
| `integrations/` | External integrations: `github/` (repo sync client), `http/` (HTTP client, query, paths)     |
| `internal/`     | Logging: `logger.ts` + `loggers/` (Pino-based, per-runtime writers)                          |
| `lib/`          | Pure utilities: `arrays.ts`, `dates.ts`, `filters.ts`, `ordering.ts`, `formatters/`          |
| `scripts/`      | CLI scripts: `seed/` (per-domain seeders), `sync-repositories.ts`, `calculate-experience.ts` |
| `styles/`       | SCSS by category (`buttons/`, `forms/`, `tables/`, `themes/`, `typography/`, …)              |
| `support/`      | Build/dev support: `enforce-node-version.ts`, `global-test-setup.ts`                         |
| `tailwind/`     | Tailwind plugin/theme extension code                                                         |
| `__tests__/`    | Jest tests (`unit/`)                                                                         |

### Components (`src/components/`)

Generic, domain-agnostic UI organized by category: `badges/`, `buttons/`, `charts/` (Nivo),
`dialogs/`, `drawers/`, `errors/`, `feedback/`, `floating/`, `forms-v2/`, `icons/`, `images/`,
`input/`, `layout/`, `loading/`, `menus/`, `pagination/` + `pagination-v2/`, `structural/`,
`tables/` (admin table infrastructure), `tags/`, `timelines/`, `tours/`, `typography/`, `uploads/`.
Component-level types in `types/`, helpers in `util/` and `config/`.

Note: `forms-v2/` and `pagination-v2/` supersede older versions — prefer the `-v2` variants.

### Data Layer (`src/database/`)

| Piece            | Location                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Prisma schema    | `src/database/prisma/schema.prisma`                                                            |
| Migrations       | `src/database/prisma/migrations/`                                                              |
| Extended client  | `src/database/prisma/client/` (`index.ts`, `middleware.ts`, `errors.ts`, `brand-extension.ts`) |
| Model wrappers   | `src/database/model/` (`skill.ts`, `project.ts`, `experience.ts`, …)                           |
| Generated client | `src/database/model/generated/` (do not edit)                                                  |
| Seed fixtures    | `src/database/fixtures/` (JSON in `fixtures/json/`)                                            |

## Placement Conventions

| Creating                 | Put It In                                                                     | Reference Example                                    |
| ------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| New site page route      | `src/app/(site)/{route}/page.tsx`                                             | `src/app/(site)/resume/experience/page.tsx`          |
| New admin resource       | `src/app/(site)/admin/{resource}/` with `@title`/`@table`/`@pagination` slots | `src/app/(site)/admin/courses/`                      |
| New API route            | `src/app/api/{resource}/route.ts` (+ `[id]/route.ts`)                         | `src/app/api/skills/`                                |
| New server action        | `src/actions/{domain}/{verb-noun}.ts`                                         | `src/actions/skills/create-skill.ts`                 |
| New action types         | `src/actions/types/{domain}.ts`                                               | `src/actions/types/skills.ts`                        |
| New domain component     | `src/features/{domain}/components/`                                           | `src/features/projects/components/ProjectTile.tsx`   |
| New generic UI component | `src/components/{category}/` (PascalCase file)                                | `src/components/buttons/DeleteButton.tsx`            |
| New hook                 | `src/hooks/use-{name}.ts` (re-export from `index.ts`)                         | `src/hooks/use-filters.ts`                           |
| New utility              | `src/lib/`                                                                    | `src/lib/ordering.ts`                                |
| New Prisma model         | `src/database/prisma/schema.prisma` + wrapper in `src/database/model/`        | `src/database/model/skill.ts`                        |
| New seed logic           | `src/scripts/seed/seed-{domain}.ts`                                           | `src/scripts/seed/seed-skills.ts`                    |
| New test                 | `src/__tests__/unit/` (mirrors source structure)                              | `src/__tests__/unit/integrations/http/query.test.ts` |

Naming: components are PascalCase (`ProjectTile.tsx`); everything else (utilities, hooks, actions,
folders) is hyphen-case. Next.js reserved files (`page`, `layout`, `route`, `default`, `error`,
`loading`) stay lowercase. See [file-naming.md](code-quality/file-naming.md) for the full rules.

## Cross-Cutting Quick Ref

| Concern            | Details                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Path alias         | `~/*` → `src/*`                                                                                                                               |
| Auth               | Clerk; server-side helpers and roles in `src/application/auth/`                                                                               |
| Data flow (client) | Component → SWR via `src/api/client.ts` → `/api/{resource}` route                                                                             |
| Data flow (server) | Server component/form → `src/actions/{domain}/*` → Prisma client                                                                              |
| DB access          | Import extended client from `src/database/prisma`                                                                                             |
| Logging            | `src/internal/logger.ts` (Pino; per-runtime writers in `src/internal/loggers/`)                                                               |
| Env config         | `src/environment/` (typed, validated)                                                                                                         |
| GitHub sync        | `src/integrations/github/` + `pnpm sync-repositories`                                                                                         |
| Redirects          | Defined in `next.config.mjs`: `/`→`/dashboard`, `/admin`→`/admin/skills`, `/resume`→`/resume/experience`, `/projects`→`/projects/greenbudget` |
| Seeding            | `pnpm seeddb` → `src/scripts/seed/index.ts`                                                                                                   |
| Testing            | Jest (`jest.config.ts`); tests in `src/__tests__/`; setup in `src/support/global-test-setup.ts`                                               |
| Lint/format        | ESLint flat config (`eslint.config.mjs`) + Prettier; custom plugin in `tooling/eslint-config-web/`                                            |

## Docs (`docs/`)

| Doc                                | Contents                                                                                                                                                                      |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/index.md`                    | Documentation index                                                                                                                                                           |
| `docs/code-quality/`               | Best practices, linting rules, markdown formatting standards                                                                                                                  |
| `docs/projects/resume-generation/` | Active project: content centralization + resume generation. Read `README.md` + `status.md` first; context in `context/`, decisions in `decisions.md`, backlog in `backlog.md` |
