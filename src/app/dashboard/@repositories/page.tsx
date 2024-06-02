import { getRepositories } from "~/actions/fetches/repositories";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";

export default async function RepositoriesPage() {
  const repositories = await getRepositories({
    visibility: "public",
    includes: [],
    filters: { highlighted: true },
  });
  return (
    <div className="flex flex-col gap-[12px]">
      {repositories.map(repository => (
        <RepositoryTile repository={repository} key={repository.id} />
      ))}
    </div>
  );
}
