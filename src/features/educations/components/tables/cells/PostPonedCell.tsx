"use client";
import { updateEducation } from "~/actions-v2/educations/update-education";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type { EducationsTableModel, EducationsTableColumn } from "~/features/educations/types";

interface RemoteCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const PostPonedCell = ({ education, table }: RemoteCellProps): JSX.Element => (
  <CheckboxCell
    attribute="postPoned"
    model={education}
    table={table}
    errorMessage="There was an error updating the education."
    action={async (id, value) => await updateEducation(id, { postPoned: value })}
  />
);
