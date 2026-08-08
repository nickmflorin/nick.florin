import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { ExperiencesDefaultOrdering, ExperiencesFiltersObj, PAGE_SIZES } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { ExperiencesTableColumns } from '~/features/experiences';
import { ExperiencesTableControlBarPlaceholder } from '~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder';

import { ExperiencesTableBody } from './ExperiencesTableBody';

export interface ExperiencesTablePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const ExperiencesTablePage = async (props: ExperiencesTablePageProps) => {
  const searchParams = await props.searchParams;
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = ExperiencesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: ExperiencesDefaultOrdering,
    fields: ExperiencesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      fallback={
        <>
          <ExperiencesTableControlBarPlaceholder />
          <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.experience} />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <ExperiencesTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default ExperiencesTablePage;
