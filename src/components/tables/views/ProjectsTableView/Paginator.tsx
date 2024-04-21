import dynamic from "next/dynamic";

import { PAGE_SIZES } from "~/actions/fetches/constants";
import { getProjectsCount, type GetProjectsFilters } from "~/actions/fetches/projects";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

interface PaginatorProps {
  readonly filters: GetProjectsFilters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getProjectsCount({ filters, visibility: "admin" });
  return <RootPaginator count={count} pageSize={PAGE_SIZES.project} />;
};
