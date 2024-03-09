import dynamic from "next/dynamic";

import { EDUCATIONS_ADMIN_TABLE_PAGE_SIZE } from "~/actions/fetches/constants";
import { getAdminEducationsCount } from "~/actions/fetches/get-educations";

import { type Filters } from "./types";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

interface PaginatorProps {
  readonly filters: Filters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getAdminEducationsCount({ filters });
  return <RootPaginator count={count} pageSize={EDUCATIONS_ADMIN_TABLE_PAGE_SIZE} />;
};
