import { type JSX } from 'react';

import { z } from 'zod';

import { ProjectsFiltersObj } from '~/actions';
import { fetchProjectsPagination } from '~/actions/projects/fetch-projects';

import { Paginator } from '~/components/pagination-v2/Paginator';

export interface ProjectsTablePaginationPageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const ProjectsTablePaginationPage = async (
  props: ProjectsTablePaginationPageProps,
): Promise<JSX.Element> => {
  const searchParams = await props.searchParams;
  const _page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = ProjectsFiltersObj.parse(searchParams);

  const {
    data: { count, page, pageSize },
  } = await fetchProjectsPagination(
    { filters, page: _page, visibility: 'admin' },
    { strict: true },
  );

  return <Paginator count={count} page={page} pageSize={pageSize} />;
};

export default ProjectsTablePaginationPage;
