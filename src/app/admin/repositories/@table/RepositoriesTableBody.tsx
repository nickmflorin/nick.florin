import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { type RepositoriesControls, type RepositoriesFilters } from '~/actions';
import { fetchRepositories } from '~/actions/repositories/fetch-repositories';

import { Loading } from '~/components/loading/Loading';
import { RepositoriesTableControlBarPlaceholder } from '~/features/repositories/components/tables/RepositoriesTableControlBarPlaceholder';

const ClientRepositoriesTableBody = dynamic(
  () =>
    import('~/features/repositories/components/tables/RepositoriesTableBody').then(
      mod => mod.RepositoriesTableBody,
    ),
  {
    loading: () => (
      <>
        <RepositoriesTableControlBarPlaceholder />
        <Loading component='tbody' isLoading />
      </>
    ),
  },
);

const getRepositories = async ({
  filters,
  ordering,
  page,
}: {
  readonly filters: RepositoriesFilters;
  readonly ordering: RepositoriesControls['ordering'];
  readonly page: number;
}) => {
  const fetcher = fetchRepositories(['skills', 'projects']);
  const { data: repositories } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: 'admin',
    },
    { strict: true },
  );
  return repositories;
};

export interface RepositoriesTableBodyProps {
  readonly filters: RepositoriesFilters;
  readonly ordering: RepositoriesControls['ordering'];
  readonly page: number;
}

export const RepositoriesTableBody = async ({
  filters,
  ordering,
  page,
}: RepositoriesTableBodyProps): Promise<JSX.Element> => {
  const repositories = await getRepositories({ filters, ordering, page });
  return <ClientRepositoriesTableBody data={repositories} />;
};
