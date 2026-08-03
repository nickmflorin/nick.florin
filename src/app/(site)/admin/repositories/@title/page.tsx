import { Suspense } from 'react';

import { RepositoriesFiltersObj } from '~/actions';

import { LoadingText } from '~/components/loading/LoadingText';

import { RepositoriesTitle } from './RepositoriesTitle';

export interface RepositoriesTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const RepositoriesTitlePage = async (props: RepositoriesTitlePageProps) => {
  const searchParams = await props.searchParams;
  const filters = RepositoriesFiltersObj.parse(searchParams);
  return (
    <Suspense fallback={<LoadingText />} key={JSON.stringify(filters)}>
      <RepositoriesTitle filters={filters} />
    </Suspense>
  );
};

export default RepositoriesTitlePage;
