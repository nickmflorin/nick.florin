'use client';
import { type JSX } from 'react';

import { updateCourse } from '~/actions/courses/update-course';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type CoursesTableColumn, type CoursesTableModel } from '~/features/courses/types';

interface VisibleCellProps {
  readonly course: CoursesTableModel;
  readonly table: types.CellDataTableInstance<CoursesTableModel, CoursesTableColumn>;
}

export const VisibleCell = ({ course, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateCourse(id, { visible: value })}
    attribute='visible'
    errorMessage='There was an error updating the course.'
    model={course}
    table={table}
  />
);
