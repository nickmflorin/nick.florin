import { z } from "zod";

import { RepositoriesFiltersObj } from "~/actions-v2";
import { fetchRepositoriesPagination } from "~/actions-v2/repositories/fetch-repositories";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface RepositoriesTablePaginationPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function RepositoriesTablePaginationPage({
  searchParams,
}: RepositoriesTablePaginationPageProps): Promise<JSX.Element> {
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = RepositoriesFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchRepositoriesPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );

  return <Paginator count={count} pageSize={pageSize} page={page} />;
}
