import dynamic from "next/dynamic";
import { memo } from "react";

import { getRepositories, type GetRepositoriesFilters } from "~/actions/fetches/repositories";

import { Loading } from "~/components/loading/Loading";
import { type ContextTableComponent } from "~/components/tables/types";

const ContextTable = dynamic(() => import("~/components/tables/ContextTable"), {
  loading: () => <Loading isLoading={true} />,
}) as ContextTableComponent;

interface RepositoriesAdminTableProps {
  readonly page: number;
  readonly filters: Omit<GetRepositoriesFilters, "highlighted">;
}

export const RepositoriesAdminTable = memo(
  async ({ page, filters }: RepositoriesAdminTableProps) => {
    const repositories = await getRepositories({
      page,
      filters,
      /* We will eventually need to include skills once we create a way to manage skills via a
         select or popover, both in general and in the table. */
      includes: ["projects", "skills"],
      visibility: "admin",
    });
    return <ContextTable data={repositories} />;
  },
);
