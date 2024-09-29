import { z } from "zod";

import { EducationsFiltersObj } from "~/actions";
import { fetchEducationsPagination } from "~/actions/educations/fetch-educations";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface EducationsTablePaginationPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function EducationsTablePaginationPage({
  searchParams,
}: EducationsTablePaginationPageProps): Promise<JSX.Element> {
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = EducationsFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchEducationsPagination(
    { filters, page: _page, visibility: "admin" },
    { strict: true },
  );

  return <Paginator count={count} pageSize={pageSize} page={page} />;
}
