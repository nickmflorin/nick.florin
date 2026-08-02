import { type ReactNode, Suspense } from 'react';

import { DataTableProvider } from '~/components/tables/DataTableProvider';
import { type ProjectsTableColumnId, ProjectsTableColumns } from '~/features/projects';

import { ProjectsDataTableWrapper } from './ProjectsDataTableWrapper';

export interface ProjectsTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ProjectsTableColumnId[];
}

export const ProjectsTableWrapper = ({ children, ...props }: ProjectsTableWrapperProps) => (
  <DataTableProvider
    areRowsDeletable
    areRowsSelectable
    columns={ProjectsTableColumns}
    controlBarTargetId='projects-admin-table-control-bar'
    hasRowActions
  >
    <Suspense fallback={null}>
      <ProjectsDataTableWrapper {...props}>{children}</ProjectsDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
