"use client";
import { updateProject } from "~/actions/projects/update-project";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
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
