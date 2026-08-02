'use client';
import { type JSX } from 'react';

import { updateExperience } from '~/actions/experiences/update-experience';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import {
  type ExperiencesTableColumn,
  type ExperiencesTableModel,
} from '~/features/experiences/types';

interface RemoteCellProps {
  readonly experience: ExperiencesTableModel;
  readonly table: types.CellDataTableInstance<ExperiencesTableModel, ExperiencesTableColumn>;
}

export const RemoteCell = ({ experience, table }: RemoteCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateExperience(id, { isRemote: value })}
    attribute='isRemote'
    errorMessage='There was an error updating the experience.'
    model={experience}
    table={table}
  />
);
