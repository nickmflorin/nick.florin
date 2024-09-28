import { type RepositoriesFilters } from "~/actions-v2";
import { fetchRepositoriesCount } from "~/actions-v2/repositories/fetch-repositories";

export interface RepositoriesTitleProps {
  readonly filters: RepositoriesFilters;
}

export const RepositoriesTitle = async ({ filters }: RepositoriesTitleProps) => {
  const {
    data: { count },
  } = await fetchRepositoriesCount({ visibility: "admin", filters }, { strict: true });
  return <>{count}</>;
};
