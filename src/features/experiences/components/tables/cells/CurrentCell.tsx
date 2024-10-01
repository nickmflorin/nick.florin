"use client";
import { updateExperience } from "~/actions/experiences/update-experience";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type { ExperiencesTableModel, ExperiencesTableColumn } from "~/features/experiences/types";

interface CurrentCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const CurrentCell = ({ experience, table }: CurrentCellProps): JSX.Element => (
  <CheckboxCell
    attribute="isCurrent"
    model={experience}
    table={table}
    errorMessage="There was an error updating the experience."
    action={async (id, value) => await updateExperience(id, { isCurrent: value })}
  />
);
