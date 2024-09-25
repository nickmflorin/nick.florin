import { type ProjectsFilters } from "~/actions-v2";
import { fetchProjectsPagination } from "~/actions-v2/projects/fetch-projects";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface ProjectsTablePaginatorProps {
  readonly filters: ProjectsFilters;
  readonly page: number;
}

export const ProjectsTablePaginator = async ({
  filters,
  page: _page,
}: ProjectsTablePaginatorProps): Promise<JSX.Element> => {
  const {
    data: { count, page, pageSize },
  } = await fetchProjectsPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );
  return <Paginator count={count} pageSize={pageSize} page={page} />;
};
