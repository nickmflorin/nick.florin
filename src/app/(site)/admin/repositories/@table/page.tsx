import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { RepositoriesDefaultOrdering, RepositoriesFiltersObj } from '~/actions';

import { Loading } from '~/components/loading/Loading';
import { columnIsOrderable } from '~/components/tables';
import { RepositoriesTableColumns } from '~/features/repositories';
import { RepositoriesTableControlBarPlaceholder } from '~/features/repositories/components/tables/RepositoriesTableControlBarPlaceholder';

import { RepositoriesTableBody } from './RepositoriesTableBody';

export interface RepositoriesTablePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const RepositoriesTablePage = async (props: RepositoriesTablePageProps) => {
  const searchParams = await props.searchParams;
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = RepositoriesFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: RepositoriesDefaultOrdering,
    fields: RepositoriesTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      fallback={
        <>
          <RepositoriesTableControlBarPlaceholder />
          <Loading component='tbody' isLoading />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <RepositoriesTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default RepositoriesTablePage;
