import { type JSX } from 'react';

import { z } from 'zod';

import { CoursesFiltersObj } from '~/actions';
import { fetchCoursesPagination } from '~/actions/courses/fetch-courses';

import { Paginator } from '~/components/pagination-v2/Paginator';

export interface CoursesTablePaginationPageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const CoursesTablePaginationPage = async (
  props: CoursesTablePaginationPageProps,
): Promise<JSX.Element> => {
  const searchParams = await props.searchParams;
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = CoursesFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchCoursesPagination({ filters, page: _page, visibility: 'admin' }, { strict: true });

  return <Paginator count={count} page={page} pageSize={pageSize} />;
};

export default CoursesTablePaginationPage;
