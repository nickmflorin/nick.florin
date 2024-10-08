"use client";
import { updateEducation } from "~/actions/educations/update-education";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type { EducationsTableModel, EducationsTableColumn } from "~/features/educations/types";

interface HighlightedCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const HighlightedCell = ({ education, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    attribute="highlighted"
    model={education}
    table={table}
    errorMessage="There was an error updating the education."
    action={async (id, value) => await updateEducation(id, { highlighted: value })}
  />
);
