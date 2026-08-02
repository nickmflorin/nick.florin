import { type JSX } from 'react';

import { type FloatingContentRenderProps } from '~/components/floating';
import { Spinner } from '~/components/icons/Spinner';
import { TableBodyRow, type TableBodyRowProps } from '~/components/tables/generic/TableBodyRow';
import type * as types from '~/components/tables/types';

import { ActionsCell, type ActionsCellProps } from '../cells/ActionsCell';
import { RowSelectCell } from '../cells/RowSelectCell';
import { TableBodyCell } from '../generic/TableBodyCell';

import { DataTableBodyCell } from './DataTableBodyCell';

export interface DataTableBodyRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableBodyRowProps, 'children'> {
  readonly actionMenuWidth?: ActionsCellProps['menuWidth'];
  readonly columns: types.DataTableColumn<D, C>[];
  readonly datum: D;
  readonly excludeColumns?: types.TableColumnId<C>[];
  readonly getRowActions?: (
    datum: D,
    params: Pick<FloatingContentRenderProps, 'setIsOpen'>,
  ) => types.DataTableRowAction[];
  readonly isSelected?: boolean;
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
  readonly shouldPerformSelectionWhenClicked?: boolean;
}

export const DataTableBodyRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  actionMenuWidth,
  columns,
  datum,
  excludeColumns = [],
  getRowActions,
  isSelected,
  onRowSelected,
  shouldPerformSelectionWhenClicked = false,
  ...props
}: DataTableBodyRowProps<D, C>): JSX.Element => (
  <TableBodyRow
    {...props}
    onClick={e => {
      e.stopPropagation();
      if (shouldPerformSelectionWhenClicked) {
        onRowSelected?.(datum, !isSelected);
      }
      props.onClick?.(e);
    }}
  >
    {isSelected === undefined && (
      <TableBodyCell align='center' className='loading-cell p-0'>
        <div className='flex flex-col h-full w-full justify-center items-center'>
          <Spinner isLoading={props.isLoading} size='18px' />
        </div>
      </TableBodyCell>
    )}
    {isSelected !== undefined && (
      <TableBodyCell align='center' className='loading-cell select-cell p-0'>
        <div className='flex flex-col h-full w-full justify-center items-center'>
          {props.isLoading ? (
            <Spinner isLoading={props.isLoading} size='18px' />
          ) : (
            <RowSelectCell
              isSelected={isSelected}
              onSelect={checked => onRowSelected?.(datum, checked)}
            />
          )}
        </div>
      </TableBodyCell>
    )}
    {columns
      .filter(col => !excludeColumns.includes(col.id))
      .map(col => (
        <DataTableBodyCell<D, C> column={col} datum={datum} key={`${col.id}-${datum.id}`} />
      ))}
    {getRowActions && (
      <TableBodyCell align='center'>
        <ActionsCell actions={params => getRowActions(datum, params)} menuWidth={actionMenuWidth} />
      </TableBodyCell>
    )}
  </TableBodyRow>
);
