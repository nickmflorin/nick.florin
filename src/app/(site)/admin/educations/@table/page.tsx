import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { EducationsDefaultOrdering, EducationsFiltersObj, PAGE_SIZES } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
import { EducationsTableColumns } from '~/features/educations';
import { EducationsTableControlBarPlaceholder } from '~/features/educations/components/tables/EducationsTableControlBarPlaceholder';

import { EducationsTableBody } from './EducationsTableBody';

export interface EducationsTablePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const EducationsTablePage = async (props: EducationsTablePageProps) => {
  const searchParams = await props.searchParams;
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = EducationsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: EducationsDefaultOrdering,
    fields: EducationsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      fallback={
        <>
          <EducationsTableControlBarPlaceholder />
          <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.education} />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <EducationsTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default EducationsTablePage;
