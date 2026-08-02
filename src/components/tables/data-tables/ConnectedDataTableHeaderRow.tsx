import { type JSX } from 'react';

import { useDataTable } from '~/components/tables/hooks';
import type * as types from '~/components/tables/types';

import { DataTableHeaderRow, type DataTableHeaderRowProps } from './DataTableHeaderRow';

export interface ConnectedDataTableHeaderRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<DataTableHeaderRowProps<D, C>, 'areRowsSelectable' | 'columns' | 'hasRowActions'> {}

export const ConnectedDataTableHeaderRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>(
  props: ConnectedDataTableHeaderRowProps<D, C>,
): JSX.Element => {
  const { rowsAreSelectable, rowsHaveActions, visibleColumns } = useDataTable<D, C>();

  return (
    <DataTableHeaderRow<D, C>
      {...props}
      areRowsSelectable={rowsAreSelectable}
      columns={visibleColumns}
      hasRowActions={rowsHaveActions}
    />
  );
};
