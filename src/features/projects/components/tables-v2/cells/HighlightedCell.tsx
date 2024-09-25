"use client";
import { updateProject } from "~/actions-v2/projects/update-project";

import { CheckboxCell } from "~/components/tables-v2/cells/CheckboxCell";
import type * as types from "~/components/tables-v2/types";
import type { ProjectsTableModel, ProjectsTableColumn } from "~/features/projects/types";

interface HighlightedCellProps {
  readonly project: ProjectsTableModel;
  readonly table: types.CellDataTableInstance<ProjectsTableModel, ProjectsTableColumn>;
}

export const HighlightedCell = ({ project, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    attribute="highlighted"
    model={project}
    table={table}
    errorMessage="There was an error updating the project."
    action={async (id, value) => await updateProject(id, { highlighted: value })}
  />
);
