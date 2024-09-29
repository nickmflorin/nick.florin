import dynamic from "next/dynamic";

import { type RepositoriesControls, type RepositoriesFilters } from "~/actions";
import { fetchRepositories } from "~/actions/repositories/fetch-repositories";

import { Loading } from "~/components/loading/Loading";
import { RepositoriesTableControlBarPlaceholder } from "~/features/repositories/components/tables/RepositoriesTableControlBarPlaceholder";

const ClientRepositoriesTableBody = dynamic(
  () =>
    import("~/features/repositories/components/tables/RepositoriesTableBody").then(
      mod => mod.RepositoriesTableBody,
    ),
  {
    loading: () => (
      <>
        <RepositoriesTableControlBarPlaceholder />
        <Loading isLoading component="tbody" />
      </>
    ),
  },
);

const getRepositories = async ({
  page,
  filters,
  ordering,
}: {
  readonly filters: RepositoriesFilters;
  readonly page: number;
  readonly ordering: RepositoriesControls["ordering"];
}) => {
  const fetcher = fetchRepositories(["skills", "projects"]);
  const { data: repositories } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: "admin",
    },
    { strict: true },
  );
  return repositories;
};

export interface RepositoriesTableBodyProps {
  readonly filters: RepositoriesFilters;
  readonly page: number;
  readonly ordering: RepositoriesControls["ordering"];
}

export const RepositoriesTableBody = async ({
  filters,
  page,
  ordering,
}: RepositoriesTableBodyProps): Promise<JSX.Element> => {
  const repositories = await getRepositories({ page, filters, ordering });
  return <ClientRepositoriesTableBody data={repositories} />;
};
