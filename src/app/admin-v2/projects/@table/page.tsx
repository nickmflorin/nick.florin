import dynamic from "next/dynamic";
import { Suspense } from "react";

import { z } from "zod";

import { parseOrdering } from "~/lib/ordering";

import { ProjectsDefaultOrdering, ProjectsFiltersObj } from "~/actions-v2";

import { Loading } from "~/components/loading/Loading";
import { columnIsOrderable } from "~/components/tables-v2";
import { ProjectsTableColumns } from "~/features/projects";
import { ProjectsTableControlBarPlaceholder } from "~/features/projects/components/tables-v2/ProjectsTableControlBarPlaceholder";
import { ProjectsTablePaginator } from "~/features/projects/components/tables-v2/ProjectsTablePaginator";

import { ProjectsTableBody } from "./ProjectsTableBody";
import { ProjectsTableFilterBar } from "./ProjectsTableFilterBar";

const ProjectsTableView = dynamic(
  () =>
    import("~/features/projects/components/tables-v2/ProjectsTableView").then(
      mod => mod.ProjectsTableView,
    ),
  { loading: () => <Loading isLoading /> },
);

const DataTableProvider = dynamic(
  () => import("~/components/tables-v2/DataTableProvider").then(mod => mod.DataTableProvider),
  {
    loading: () => <Loading isLoading />,
  },
);

export interface ProjectsTablePageProps {
  readonly searchParams: Record<string, string>;
}

export default function ProjectsTablePage({ searchParams }: ProjectsTablePageProps) {
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = ProjectsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: ProjectsDefaultOrdering,
    fields: ProjectsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });
  return (
    <DataTableProvider
      columns={ProjectsTableColumns}
      controlBarTargetId="projects-admin-table-control-bar"
      rowsAreDeletable
      rowsAreSelectable
      rowsHaveActions
    >
      <ProjectsTableView
        filterBar={
          <Suspense>
            <ProjectsTableFilterBar filters={filters} />
          </Suspense>
        }
        pagination={<ProjectsTablePaginator filters={filters} page={page} />}
      >
        <Suspense
          key={JSON.stringify(filters) + JSON.stringify(ordering) + String(page)}
          fallback={
            <>
              <ProjectsTableControlBarPlaceholder />
              <Loading isLoading component="tbody" />
            </>
          }
        >
          <ProjectsTableBody filters={filters} page={page} ordering={ordering} />
        </Suspense>
      </ProjectsTableView>
    </DataTableProvider>
  );
}
