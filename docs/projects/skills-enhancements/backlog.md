# Backlog

The running list of work items, organized by area. Check items off as they land (`[x]`), and add new
items to the appropriate section as they come up. Items are independent unless noted; each lands on
its own branch/PR.

## Skills Display

- [ ] **Replace the skills bar chart with a proficiency-bucketed display.** The dashboard chart
      (`src/features/skills/components/SkillsChartModule.tsx` →
      `charts/SkillsBarChartView/ClientSkillsBarChart.tsx`, rendered from
      `src/app/(site)/dashboard/@chart/page.tsx`) plots one bar per skill by `calculatedExperience`
      in years. Replace it with a display organized around the bucketed proficiency groups —
      `ADVANCED`, `EXPERT`, `PROFICIENT`, `FAMILIAR`, per the `Proficiency` enum on the `Competency`
      model in `src/database/prisma/schema.prisma` — so skills are communicated by tier rather than
      a single years axis. Design is open (grouped columns, tiered rows/sections, per-bucket tag
      clusters, …); the resume documents' `CompetencyBar`
      (`src/documents/resume/components/CompetencyBar.tsx`) already renders these tiers and is prior
      art for the visual language. Gated on the data-source question in
      [open-questions.md](./open-questions.md): adopt `Competency` on the site, or bucket legacy
      `Skill` data in the interim.

- [ ] **Add tag-only skill views.** Views in which a set of skills renders purely as tags — no
      proficiency bar, no experience metric — for skills whose presence matters but whose metric is
      not meaningful or not set (e.g. `Competency` rows with a null `proficiency`). The existing
      badge components (`src/features/skills/components/badges/Skills.tsx` / `SkillBadge.tsx`, which
      already sort prioritized-first and open the `VIEW_SKILL` drawer on click) are the starting
      point; the work is deciding where these views live (dashboard module, sections of the new
      skills page, resume surfaces) and which skills belong in them. Scope to be confirmed — see
      [open-questions.md](./open-questions.md).

## Skills Discovery

- [ ] **Build a master skills list page.** A public, searchable page (e.g. `/skills` under
      `src/app/(site)/`) listing every visible skill, used to identify and explore skills. Should
      support text search at minimum, with the existing filter dimensions (categories, programming
      domains/languages, related experiences/educations) as candidates for refinement; clicking a
      skill opens the `VIEW_SKILL` drawer (`src/features/skills/components/drawers/SkillDrawer/`) or
      a dedicated detail view. The admin skills table's search/filtering
      (`src/features/skills/components/tables/SkillsTableFilterBar.tsx`, `use-filters.ts`, and the
      `GET /api/skills` query support) is prior art for the mechanics, but this page is a
      public-facing browse/discovery surface, not a data table. Decided 2026-08-09 (recorded in the
      app-performance decision log): this page's search/filter state is **URL-driven** — the pattern
      was evaluated for the dashboard chart filters and deliberately reserved for this surface
      instead, where deep-linkable filtered views, back/forward navigation, and shareable URLs are
      part of the feature rather than overhead.

## Global Search

- [ ] **Add a global search bar for portfolio content.** A site-wide search input (header search bar
      and/or command-palette style) that searches across content types — skills, projects,
      experiences, educations, repositories, courses — and navigates to the matching page, drawer,
      or section. Nothing like this exists on the public site today; per-resource search exists only
      in the admin tables and the `/api/{resource}` query params. Needs design for the result model
      (grouped-by-type results, ranking) and for where matches take the user; the skills list page's
      search can be a scoped first consumer of the same backing query.
