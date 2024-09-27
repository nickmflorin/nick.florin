import { z } from "zod";

import { SkillsFiltersObj } from "~/actions-v2";
import { fetchSkillsPagination } from "~/actions-v2/skills/fetch-skills";

import { Paginator } from "~/components/pagination-v2/Paginator";

export interface SkillsTablePaginationPageProps {
  readonly searchParams: Record<string, string>;
}

export default async function SkillsTablePaginationPage({
  searchParams,
}: SkillsTablePaginationPageProps): Promise<JSX.Element> {
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams?.page).data ?? 1;

  const filters = SkillsFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchSkillsPagination({ filters, page: _page, visibility: "admin" }, { strict: true });

  return <Paginator count={count} pageSize={pageSize} page={page} />;
}
