'use client';
import { type JSX } from 'react';

import {
  ConnectedDataTableBody,
  type ConnectedDataTableBodyProps,
} from '~/components/tables/data-tables/ConnectedDataTableBody';
import { type ProjectsTableColumn, type ProjectsTableModel } from '~/features/projects';

import { useProjectsTableColumnProperties } from './hooks/use-column-properties';
import { useProjectsTableRowActions } from './hooks/use-row-actions';
import { ProjectsTableControlBar } from './ProjectsTableControlBar';

export interface ProjectsTableBodyProps extends Omit<
  ConnectedDataTableBodyProps<ProjectsTableModel, ProjectsTableColumn>,
  'columnProperties' | 'columns' | 'getRowActions' | 'onRowSelected' | 'rowIsSelected'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const ProjectsTableBody = ({
  areControlBarTooltipsInPortal,
  ...props
}: ProjectsTableBodyProps): JSX.Element => {
  const columnProperties = useProjectsTableColumnProperties();
  const rowActions = useProjectsTableRowActions();

  return (
    <>
      <ProjectsTableControlBar
        areTooltipsInPortal={areControlBarTooltipsInPortal}
        data={props.data}
        isDisabled={props.isEmpty}
      />
      <ConnectedDataTableBody<ProjectsTableModel, ProjectsTableColumn>
        emptyContent='There are no projects.'
        noResultsContent='No projects found for search criteria.'
        shouldPerformSelectionWhenClicked
        {...props}
        columnProperties={columnProperties}
        getRowActions={(project, { setIsOpen }) =>
          rowActions(project, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};
