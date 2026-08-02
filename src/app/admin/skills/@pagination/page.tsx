import { type JSX } from 'react';

import { z } from 'zod';

import { SkillsFiltersObj } from '~/actions';
import { fetchSkillsPagination } from '~/actions/skills/fetch-skills';

import { Paginator } from '~/components/pagination-v2/Paginator';

export interface SkillsTablePaginationPageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const SkillsTablePaginationPage = async (
  props: SkillsTablePaginationPageProps,
): Promise<JSX.Element> => {
  const searchParams = await props.searchParams;
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = SkillsFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchSkillsPagination({ filters, page: _page, visibility: 'admin' }, { strict: true });

  return <Paginator count={count} page={page} pageSize={pageSize} />;
};

export default SkillsTablePaginationPage;
