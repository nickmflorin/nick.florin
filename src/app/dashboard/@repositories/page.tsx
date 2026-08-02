import { fetchRepositories } from '~/actions/repositories/fetch-repositories';

import { RepositoryTile } from '~/features/repositories/components/RepositoryTile';

const RepositoriesPage = async () => {
  const fetcher = fetchRepositories([]);
  const { data: repositories } = await fetcher(
    {
      filters: { highlighted: true },
      visibility: 'public',
    },
    { strict: true },
  );
  return (
    <div className='flex flex-col gap-[8px]'>
      {repositories.map(repository => (
        <RepositoryTile key={repository.id} repository={repository} />
      ))}
    </div>
  );
};

export default RepositoriesPage;
