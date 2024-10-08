"use client";
import { updateCourse } from "~/actions/courses/update-course";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type { CoursesTableModel, CoursesTableColumn } from "~/features/courses/types";

interface VisibleCellProps {
  readonly course: CoursesTableModel;
  readonly table: types.CellDataTableInstance<CoursesTableModel, CoursesTableColumn>;
}

export const VisibleCell = ({ course, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    attribute="visible"
    model={course}
    table={table}
    errorMessage="There was an error updating the course."
    action={async (id, value) => await updateCourse(id, { visible: value })}
  />
);
