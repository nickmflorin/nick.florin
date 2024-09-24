"use client";
import { updateExperience } from "~/actions-v2/experiences/update-experience";

import { CheckboxCell } from "~/components/tables-v2/cells/CheckboxCell";
import type * as types from "~/components/tables-v2/types";
import type { ExperiencesTableModel, ExperiencesTableColumn } from "~/features/experiences/types";

interface RemoteCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const RemoteCell = ({ experience, table }: RemoteCellProps): JSX.Element => (
  <CheckboxCell
    attribute="isRemote"
    model={experience}
    table={table}
    errorMessage="There was an error updating the experience."
    action={async (id, value) => await updateExperience(id, { isRemote: value })}
  />
);
