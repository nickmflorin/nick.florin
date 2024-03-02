import { EDUCATIONS_ADMIN_TABLE_PAGE_SIZE } from "~/actions/fetches/constants";
import { getAdminEducationsCount } from "~/actions/fetches/get-educations";
import { Paginator as RootPaginator } from "~/components/pagination/Paginator";

import { type Filters } from "./types";

interface PaginatorProps {
  readonly filters: Filters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getAdminEducationsCount({ filters });
  return <RootPaginator count={count} pageSize={EDUCATIONS_ADMIN_TABLE_PAGE_SIZE} />;
};
