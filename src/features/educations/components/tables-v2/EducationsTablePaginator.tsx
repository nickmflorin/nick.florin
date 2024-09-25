import { type EducationsFilters } from "~/actions-v2";
import { fetchEducationsPagination } from "~/actions-v2/educations/fetch-educations";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface EducationsTablePaginatorProps {
  readonly filters: EducationsFilters;
  readonly page: number;
}

export const EducationsTablePaginator = async ({
  filters,
  page: _page,
}: EducationsTablePaginatorProps): Promise<JSX.Element> => {
  const {
    data: { count, page, pageSize },
  } = await fetchEducationsPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );
  return <Paginator count={count} pageSize={pageSize} page={page} />;
};
