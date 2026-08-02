import { type JSX, type ReactNode } from 'react';

import type * as types from './types';

import { arraysHaveSameElements } from '~/lib';

import { ConnectedColumnSelect } from './ConnectedColumnSelect';
import { useDataTable } from './hooks';
import { TableControlBar, type TableControlBarProps } from './TableControlBar';

export interface ConnectedTableControlBarProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<
  TableControlBarProps<D, C>,
  | 'areAllRowsSelected'
  | 'areRowsDeletable'
  | 'children'
  | 'columns'
  | 'onSelectAllRows'
  | 'onVisibleColumnsChange'
  | 'selectedRows'
  | 'targetId'
  | 'visibleColumns'
> {
  readonly children?: ((props: { readonly selectedRows: D[] }) => ReactNode) | ReactNode;
  readonly data: D[];
}

export const ConnectedTableControlBar = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  children,
  data,
  ...props
}: ConnectedTableControlBarProps<D, C>): JSX.Element => {
  const { controlBarTargetId, rowsAreDeletable, selectedRows, setSelectedRows } = useDataTable<D>();

  return (
    <TableControlBar
      {...props}
      areAllRowsSelected={
        data.length !== 0 &&
        arraysHaveSameElements(
          selectedRows.map(r => r.id),
          data.map(datum => datum.id),
        )
      }
      areRowsDeletable={rowsAreDeletable}
      columnsSelect={<ConnectedColumnSelect />}
      onSelectAllRows={v => setSelectedRows(v ? data : [])}
      selectedRows={selectedRows}
      targetId={controlBarTargetId}
    >
      {typeof children === 'function' ? children({ selectedRows }) : children}
    </TableControlBar>
  );
};

export type ConnectedTableControlBarComponent = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>(
  props: ConnectedTableControlBarProps<D, C>,
) => JSX.Element;
