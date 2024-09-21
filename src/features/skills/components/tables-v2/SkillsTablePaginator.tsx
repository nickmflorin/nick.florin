import { type SkillsFilters } from "~/actions-v2";
import { fetchSkillsPagination } from "~/actions-v2/skills/fetch-skills";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface SkillsTablePaginatorProps {
  readonly filters: SkillsFilters;
  readonly page: number;
}

export const SkillsTablePaginator = async ({
  filters,
  page: _page,
}: SkillsTablePaginatorProps): Promise<JSX.Element> => {
  const {
    data: { count, page, pageSize },
  } = await fetchSkillsPagination({ filters, page: _page, visibility: "admin" }, { strict: true });
  return <Paginator count={count} pageSize={pageSize} page={page} />;
};
