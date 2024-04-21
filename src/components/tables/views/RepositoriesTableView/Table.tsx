import dynamic from "next/dynamic";

import { getRepositories, type GetRepositoriesFilters } from "~/actions/fetches/repositories";
import { Loading } from "~/components/feedback/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

const ContextTable = dynamic(() => import("~/components/tables/generic/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface RepositoriesAdminTableProps {
  readonly page: number;
  readonly filters: GetRepositoriesFilters;
}

export const RepositoriesAdminTable = async ({ page, filters }: RepositoriesAdminTableProps) => {
  const repositories = await getRepositories({
    page,
    filters,
    /* We will eventually need to include skills once we create a way to manage skills via a select
       or popover, both in general and in the table. */
    includes: ["projects", "skills"],
    visibility: "admin",
  });
  return <ContextTable data={repositories} />;
};
