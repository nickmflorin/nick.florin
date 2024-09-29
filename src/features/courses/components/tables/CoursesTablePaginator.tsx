import { type CoursesFilters } from "~/actions";
import { fetchCoursesPagination } from "~/actions/courses/fetch-courses";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface CoursesTablePaginatorProps {
  readonly filters: CoursesFilters;
  readonly page: number;
}

export const CoursesTablePaginator = async ({
  filters,
  page: _page,
}: CoursesTablePaginatorProps): Promise<JSX.Element> => {
  const {
    data: { count, page, pageSize },
  } = await fetchCoursesPagination({ filters, page: _page, visibility: "admin" }, { strict: true });
  return <Paginator count={count} pageSize={pageSize} page={page} />;
};
