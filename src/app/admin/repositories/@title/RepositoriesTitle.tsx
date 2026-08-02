import { type RepositoriesFilters } from '~/actions';
import { fetchRepositoriesCount } from '~/actions/repositories/fetch-repositories';

export interface RepositoriesTitleProps {
  readonly filters: RepositoriesFilters;
}

export const RepositoriesTitle = async ({ filters }: RepositoriesTitleProps) => {
  const {
    data: { count },
  } = await fetchRepositoriesCount({ filters, visibility: 'admin' }, { strict: true });
  return <>{count}</>;
};
