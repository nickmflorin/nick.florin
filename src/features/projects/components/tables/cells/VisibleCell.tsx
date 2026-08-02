'use client';
import { type JSX } from 'react';

import { updateProject } from '~/actions/projects/update-project';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type ProjectsTableColumn, type ProjectsTableModel } from '~/features/projects/types';

interface VisibleCellProps {
  readonly project: ProjectsTableModel;
  readonly table: types.CellDataTableInstance<ProjectsTableModel, ProjectsTableColumn>;
}

export const VisibleCell = ({ project, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateProject(id, { visible: value })}
    attribute='visible'
    errorMessage='There was an error updating the project.'
    model={project}
    table={table}
  />
);
