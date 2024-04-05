import dynamic from "next/dynamic";

import { PROJECTS_ADMIN_TABLE_PAGE_SIZE } from "~/actions/fetches/constants";
import { getProjectsCount } from "~/actions/fetches/projects";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

import { type Filters } from "./types";

interface PaginatorProps {
  readonly filters: Filters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getProjectsCount({ filters });
  return <RootPaginator count={count} pageSize={PROJECTS_ADMIN_TABLE_PAGE_SIZE} />;
};
