import { type JSX } from 'react';

import { useDataTable } from '~/components/tables/hooks';
import type * as types from '~/components/tables/types';

import { DataTableBodyRow, type DataTableBodyRowProps } from './DataTableBodyRow';

export interface ConnectedDataTableBodyRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<DataTableBodyRowProps<D, C>, 'onRowSelected' | 'rowIsSelected'> {}

export const ConnectedDataTableBodyRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>(
  props: ConnectedDataTableBodyRowProps<D, C>,
): JSX.Element => {
  const { changeRowSelection, columnIsVisible, rowIsLoading, rowIsLocked, rowIsSelected } =
    useDataTable();

  return (
    <DataTableBodyRow
      {...props}
      columns={props.columns.filter(col => columnIsVisible(col.id))}
      isLoading={rowIsLoading(props.datum.id)}
      isLocked={rowIsLocked(props.datum.id)}
      isSelected={rowIsSelected(props.datum.id)}
      onRowSelected={(datum, isSelected) => changeRowSelection(datum, isSelected)}
    />
  );
};
