'use client';
import { type JSX } from 'react';

import { updateRepository } from '~/actions/repositories/update-repository';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import {
  type RepositoriesTableColumn,
  type RepositoriesTableModel,
} from '~/features/repositories/types';

interface VisibleCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const VisibleCell = ({ repository, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateRepository(id, { visible: value })}
    attribute='visible'
    errorMessage='There was an error updating the repository.'
    model={repository}
    table={table}
  />
);
