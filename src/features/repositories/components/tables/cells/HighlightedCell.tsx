'use client';
import { type JSX } from 'react';

import { updateRepository } from '~/actions/repositories/update-repository';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import {
  type RepositoriesTableColumn,
  type RepositoriesTableModel,
} from '~/features/repositories/types';

interface HighlightedCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const HighlightedCell = ({ repository, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateRepository(id, { highlighted: value })}
    attribute='highlighted'
    errorMessage='There was an error updating the repository.'
    model={repository}
    table={table}
  />
);
