import { SKILLS_ADMIN_TABLE_PAGE_SIZE } from "~/actions/fetches/constants";
import { getAdminExperiencesCount } from "~/actions/fetches/get-experiences";
import { Paginator as RootPaginator } from "~/components/pagination/Paginator";

import { type Filters } from "./types";

interface PaginatorProps {
  readonly filters: Filters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getAdminExperiencesCount({ filters });
  return <RootPaginator count={count} pageSize={SKILLS_ADMIN_TABLE_PAGE_SIZE} />;
};
