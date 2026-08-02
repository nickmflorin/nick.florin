import { type JSX, useEffect } from 'react';

import { useDataTable } from '~/components/tables/hooks';
import type * as types from '~/components/tables/types';

import { AbstractDataTableBody, type AbstractDataTableBodyProps } from './AbstractDataTableBody';
import { ConnectedDataTableBodyRow } from './ConnectedDataTableBodyRow';

export interface ConnectedDataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<AbstractDataTableBodyProps<D, C>, 'children' | 'columns'> {
  readonly shouldPerformSelectionWhenClicked?: boolean;
}

export const ConnectedDataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  shouldPerformSelectionWhenClicked,
  ...props
}: ConnectedDataTableBodyProps<D, C>): JSX.Element => {
  const { columns, syncSelectedRows } = useDataTable<D, C>();

  useEffect(() => {
    syncSelectedRows(props.data);
  }, [props.data, syncSelectedRows]);

  return (
    <AbstractDataTableBody {...props} columns={columns}>
      {ps => (
        <ConnectedDataTableBodyRow<D, C>
          {...ps}
          shouldPerformSelectionWhenClicked={shouldPerformSelectionWhenClicked}
        />
      )}
    </AbstractDataTableBody>
  );
};
