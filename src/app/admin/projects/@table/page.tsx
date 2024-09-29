import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { ProjectsDefaultOrdering, ProjectsFiltersObj } from "~/actions";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables";
import { ProjectsTableColumns } from "~/features/projects";
import { ProjectsTableControlBarPlaceholder } from "~/features/projects/components/tables/ProjectsTableControlBarPlaceholder";

import { ProjectsTableBody } from "./ProjectsTableBody";

export interface ProjectsTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ProjectsTablePage({ searchParams }: ProjectsTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = ProjectsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: ProjectsDefaultOrdering,
    fields: ProjectsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
      fallback={
        <>
          <ProjectsTableControlBarPlaceholder />
          <Loading isLoading component="tbody" />
        </>
      }
    >
      <ProjectsTableBody filters={filters} page={page} ordering={ordering} />
    </Suspense>
  );
}
