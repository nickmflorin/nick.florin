'use client';
import { type JSX } from 'react';

import { updateEducation } from '~/actions/educations/update-education';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type EducationsTableColumn, type EducationsTableModel } from '~/features/educations/types';

interface RemoteCellProps {
  readonly education: EducationsTableModel;
  readonly table: types.CellDataTableInstance<EducationsTableModel, EducationsTableColumn>;
}

export const PostPonedCell = ({ education, table }: RemoteCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateEducation(id, { postPoned: value })}
    attribute='postPoned'
    errorMessage='There was an error updating the education.'
    model={education}
    table={table}
  />
);
