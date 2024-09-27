import { z } from "zod";

import { ProjectsFiltersObj } from "~/actions-v2";
import { fetchProjectsPagination } from "~/actions-v2/projects/fetch-projects";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface ProjectsTablePaginationPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ProjectsTablePaginationPage({
  searchParams,
}: ProjectsTablePaginationPageProps): Promise<JSX.Element> {
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = ProjectsFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchProjectsPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );

  return <Paginator count={count} pageSize={pageSize} page={page} />;
}
