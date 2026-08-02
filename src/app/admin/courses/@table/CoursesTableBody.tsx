import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type CoursesControls, type CoursesFilters } from '~/actions';
import { fetchCourses } from '~/actions/courses/fetch-courses';

import { Loading } from '~/components/loading/Loading';
import { CoursesTableControlBarPlaceholder } from '~/features/courses/components/tables/CoursesTableControlBarPlaceholder';

const ClientCoursesTableBody = dynamic(
  () =>
    import('~/features/courses/components/tables/CoursesTableBody').then(
      mod => mod.CoursesTableBody,
    ),
  {
    loading: () => (
      <>
        <CoursesTableControlBarPlaceholder />
        <Loading component='tbody' isLoading />
      </>
    ),
  },
);

const getCourses = async ({
  filters,
  ordering,
  page,
}: {
  readonly filters: CoursesFilters;
  readonly ordering: CoursesControls['ordering'];
  readonly page: number;
}) => {
  const fetcher = fetchCourses(['skills', 'education']);
  const { data: courses } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: 'admin',
    },
    { strict: true },
  );
  return courses;
};

export interface CoursesTableBodyProps {
  readonly filters: CoursesFilters;
  readonly ordering: CoursesControls['ordering'];
  readonly page: number;
}

export const CoursesTableBody = async ({
  filters,
  ordering,
  page,
}: CoursesTableBodyProps): Promise<JSX.Element> => {
  const courses = await getCourses({ filters, ordering, page });
  return <ClientCoursesTableBody data={courses} />;
};
