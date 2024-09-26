import { RepositoriesFiltersObj } from "~/actions-v2";
import { fetchRepositoriesCount } from "~/actions-v2/repositories/fetch-repositories";

export interface RepositoriesTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function RepositoriesTitlePage({ searchParams }: RepositoriesTitlePageProps) {
  const filters = RepositoriesFiltersObj.parse(searchParams);
  const {
    data: { count },
  } = await fetchRepositoriesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
}
