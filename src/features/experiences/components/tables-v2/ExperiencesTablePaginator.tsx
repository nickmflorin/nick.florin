import { type ExperiencesFilters } from "~/actions-v2";
import { fetchExperiencesPagination } from "~/actions-v2/experiences/fetch-experiences";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface ExperiencesTablePaginatorProps {
  readonly filters: ExperiencesFilters;
  readonly page: number;
}

export const ExperiencesTablePaginator = async ({
  filters,
  page: _page,
}: ExperiencesTablePaginatorProps): Promise<JSX.Element> => {
  const {
    data: { count, page, pageSize },
  } = await fetchExperiencesPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );
  return <Paginator count={count} pageSize={pageSize} page={page} />;
};
