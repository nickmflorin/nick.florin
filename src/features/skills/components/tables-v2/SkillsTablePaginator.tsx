import { type ActionVisibility, type SkillsFilters } from "~/actions-v2";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface SkillsTablePaginatorProps {
  readonly filters: SkillsFilters;
  readonly page: number;
  readonly visibility: ActionVisibility;
}

export const SkillsTablePaginator = async ({
  filters,
  page: _page,
  visibility,
}: SkillsTablePaginatorProps): Promise<JSX.Element> => (
  /* const {
       data: { count, page, pageSize },
     } = await fetchSkillsPagination({ filters, page: _page, visibility }, { strict: true });
     return <Paginator count={count} pageSize={pageSize} page={page} />; */
  <Paginator count={100} pageSize={10} page={1} />
);
