import { Suspense } from 'react';

import { CoursesFiltersObj } from '~/actions';

import { LoadingText } from '~/components/loading/LoadingText';

import { CoursesTitle } from './CoursesTitle';

export interface CoursesTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const CoursesTitlePage = async (props: CoursesTitlePageProps) => {
  const searchParams = await props.searchParams;
  const filters = CoursesFiltersObj.parse(searchParams);
  return (
    <Suspense fallback={<LoadingText />} key={JSON.stringify(filters)}>
      <CoursesTitle filters={filters} />
    </Suspense>
  );
};

export default CoursesTitlePage;
