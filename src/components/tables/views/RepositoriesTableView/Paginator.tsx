import dynamic from "next/dynamic";

import { PAGE_SIZES } from "~/actions/fetches/constants";
import { getRepositoriesCount, type GetRepositoriesFilters } from "~/actions/fetches/repositories";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

interface PaginatorProps {
  readonly filters: GetRepositoriesFilters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getRepositoriesCount({ filters, visibility: "admin" });
  return <RootPaginator count={count} pageSize={PAGE_SIZES.project} />;
};
