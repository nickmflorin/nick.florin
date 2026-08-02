'use client';
import { type JSX } from 'react';

import { updateExperience } from '~/actions/experiences/update-experience';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import {
  type ExperiencesTableColumn,
  type ExperiencesTableModel,
} from '~/features/experiences/types';

interface CurrentCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const CurrentCell = ({ experience, table }: CurrentCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateExperience(id, { isCurrent: value })}
    attribute='isCurrent'
    errorMessage='There was an error updating the experience.'
    model={experience}
    table={table}
  />
);
