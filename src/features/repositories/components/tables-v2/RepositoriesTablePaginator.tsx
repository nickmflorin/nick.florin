import { type RepositoriesFilters } from "~/actions-v2";
import { fetchRepositoriesPagination } from "~/actions-v2/repositories/fetch-repositories";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface RepositoriesTablePaginatorProps {
  readonly filters: RepositoriesFilters;
  readonly page: number;
}

export const RepositoriesTablePaginator = async ({
  filters,
  page: _page,
}: RepositoriesTablePaginatorProps): Promise<JSX.Element> => {
  const {
    data: { count, page, pageSize },
  } = await fetchRepositoriesPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );
  return <Paginator count={count} pageSize={pageSize} page={page} />;
};
