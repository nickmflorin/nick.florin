'use client';
import { type JSX } from 'react';

import { updateProject } from '~/actions/projects/update-project';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type ProjectsTableColumn, type ProjectsTableModel } from '~/features/projects/types';

interface HighlightedCellProps {
  readonly project: ProjectsTableModel;
  readonly table: types.CellDataTableInstance<ProjectsTableModel, ProjectsTableColumn>;
}

export const HighlightedCell = ({ project, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateProject(id, { highlighted: value })}
    attribute='highlighted'
    errorMessage='There was an error updating the project.'
    model={project}
    table={table}
  />
);
