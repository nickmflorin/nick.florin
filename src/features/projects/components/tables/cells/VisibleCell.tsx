"use client";
import { updateProject } from "~/actions-v2/projects/update-project";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type { ProjectsTableModel, ProjectsTableColumn } from "~/features/projects/types";

interface VisibleCellProps {
  readonly project: ProjectsTableModel;
  readonly table: types.CellDataTableInstance<ProjectsTableModel, ProjectsTableColumn>;
}

export const VisibleCell = ({ project, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    attribute="visible"
    model={project}
    table={table}
    errorMessage="There was an error updating the project."
    action={async (id, value) => await updateProject(id, { visible: value })}
  />
);
