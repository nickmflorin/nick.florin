'use client';
import { type ReactNode } from 'react';

import { ProjectsDefaultOrdering } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableWrapper } from '~/components/tables/data-tables/ConnectedDataTableWrapper';
import {
  type ProjectsTableColumn,
  type ProjectsTableColumnId,
  ProjectsTableColumns,
  type ProjectsTableModel,
  type ProjectsTableOrderableColumnId,
} from '~/features/projects';
import { useOrdering } from '~/hooks/use-ordering';

export interface ProjectsDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ProjectsTableColumnId[];
}

export const ProjectsDataTableWrapper = ({
  children,
  excludeColumns,
}: ProjectsDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<ProjectsTableOrderableColumnId>({
    defaultOrdering: ProjectsDefaultOrdering,
    fields: [...ProjectsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    useQueryParams: true,
  });
  return (
    <ConnectedDataTableWrapper<ProjectsTableModel, ProjectsTableColumn>
      excludeColumns={excludeColumns}
      onSort={(e, col) => setOrdering({ field: col.id })}
      ordering={ordering}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
