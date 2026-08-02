import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { ProjectsDefaultOrdering, ProjectsFiltersObj } from '~/actions';

import { Loading } from '~/components/loading/Loading';
import { columnIsOrderable } from '~/components/tables';
import { ProjectsTableColumns } from '~/features/projects';
import { ProjectsTableControlBarPlaceholder } from '~/features/projects/components/tables/ProjectsTableControlBarPlaceholder';

import { ProjectsTableBody } from './ProjectsTableBody';

export interface ProjectsTablePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

const ProjectsTablePage = async (props: ProjectsTablePageProps) => {
  const searchParams = await props.searchParams;
  const page = z.coerce.number().int().positive().min(1).safeParse(searchParams.page).data ?? 1;

  const filters = ProjectsFiltersObj.parse(searchParams);

  const ordering = parseOrdering(searchParams, {
    defaultOrdering: ProjectsDefaultOrdering,
    fields: ProjectsTableColumns.filter(c => columnIsOrderable(c)).map(c => c.id),
  });

  return (
    <Suspense
      fallback={
        <>
          <ProjectsTableControlBarPlaceholder />
          <Loading component='tbody' isLoading />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <ProjectsTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default ProjectsTablePage;
