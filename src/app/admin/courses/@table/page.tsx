import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { CoursesDefaultOrdering, CoursesFiltersObj } from '~/actions';

import { Loading } from '~/components/loading/Loading';
import { columnIsOrderable } from '~/components/tables';
import { CoursesTableColumns } from '~/features/courses';
import { CoursesTableControlBarPlaceholder } from '~/features/courses/components/tables/CoursesTableControlBarPlaceholder';

import { CoursesTableBody } from './CoursesTableBody';

export interface CoursesTablePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const CoursesTablePage = async (props: CoursesTablePageProps) => {
  const searchParams = await props.searchParams;
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = CoursesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: CoursesDefaultOrdering,
    fields: CoursesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      fallback={
        <>
          <CoursesTableControlBarPlaceholder />
          <Loading component='tbody' isLoading />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <CoursesTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default CoursesTablePage;
