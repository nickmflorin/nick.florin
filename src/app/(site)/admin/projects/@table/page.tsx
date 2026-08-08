import { Suspense } from 'react';

import { z } from 'zod';

import { parseOrdering } from '~/lib/ordering';

import { PAGE_SIZES, ProjectsDefaultOrdering, ProjectsFiltersObj } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableBodySkeleton } from '~/components/tables/data-tables/ConnectedDataTableBodySkeleton';
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
          <ConnectedDataTableBodySkeleton numRows={PAGE_SIZES.project} />
        </>
      }
      key={JSON.stringify(filters) + JSON.stringify(ordering) + JSON.stringify(page)}
    >
      <ProjectsTableBody filters={filters} ordering={ordering} page={page} />
    </Suspense>
  );
};

export default ProjectsTablePage;
