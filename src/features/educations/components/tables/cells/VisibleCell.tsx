"use client";
import { updateEducation } from "~/actions-v2/educations/update-education";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type { EducationsTableModel, EducationsTableColumn } from "~/features/educations/types";

interface VisibleCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const VisibleCell = ({ education, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    attribute="visible"
    model={education}
    table={table}
    errorMessage="There was an error updating the education."
    action={async (id, value) => await updateEducation(id, { visible: value })}
  />
);
