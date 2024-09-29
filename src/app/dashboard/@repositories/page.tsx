import { fetchRepositories } from "~/actions/repositories/fetch-repositories";

import { RepositoryTile } from "~/features/repositories/components/RepositoryTile";

export default async function RepositoriesPage() {
  const fetcher = fetchRepositories([]);
  const { data: repositories } = await fetcher(
    {
      visibility: "public",
      filters: { highlighted: true },
    },
    { strict: true },
  );
  return (
    <div className="flex flex-col gap-[8px]">
      {repositories.map(repository => (
        <RepositoryTile repository={repository} key={repository.id} />
      ))}
    </div>
  );
}
