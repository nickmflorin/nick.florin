import { z } from "zod";

import { CoursesFiltersObj } from "~/actions-v2";
import { fetchCoursesPagination } from "~/actions-v2/courses/fetch-courses";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface CoursesTablePaginationPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function CoursesTablePaginationPage({
  searchParams,
}: CoursesTablePaginationPageProps): Promise<JSX.Element> {
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = CoursesFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchCoursesPagination({ filters, page: _page, visibility: "admin" }, { strict: true });

  return <Paginator count={count} pageSize={pageSize} page={page} />;
}
