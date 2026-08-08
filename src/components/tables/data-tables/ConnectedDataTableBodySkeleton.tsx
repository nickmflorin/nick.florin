'use client';
import { type JSX } from 'react';

import { Skeleton } from '~/components/loading/Skeleton';
import { TableBody } from '~/components/tables/generic/TableBody';
import { TableBodyCell } from '~/components/tables/generic/TableBodyCell';
import { TableBodyRow } from '~/components/tables/generic/TableBodyRow';
import { useDataTable } from '~/components/tables/hooks/use-data-table';
import { type ComponentProps } from '~/components/types';

/**
 * The height of a cell's placeholder, matching the 18px line height a body cell's text renders at.
 * A skeleton row is then exactly as tall as a populated one: that line plus the 6px of padding
 * above and below it that the tables' `small` size applies to every body cell.
 */
const CellSkeletonHeight = 18;

export interface ConnectedDataTableBodySkeletonProps extends ComponentProps {
  readonly numRows?: number;
}

/**
 * The row-shaped fallback for an admin table's body.
 *
 * The `@table` slot renders inside the table's provider, so the skeleton reads the same visible
 * column set, selection column and actions column that the real rows are built from. The
 * placeholder rows therefore occupy exactly the columns the header has already laid out, and the
 * rows they are replaced by are the same height.
 */
export const ConnectedDataTableBodySkeleton = ({
  numRows = 8,
  ...props
}: ConnectedDataTableBodySkeletonProps): JSX.Element => {
  const { rowsAreSelectable, rowsHaveActions, visibleColumns } = useDataTable();
  return (
    <TableBody {...props}>
      {Array.from({ length: numRows }).map((_, i) => (
        <TableBodyRow key={i} tabIndex={-1}>
          {rowsAreSelectable ? <TableBodyCell align='center' className='select-cell p-0' /> : null}
          {visibleColumns.map(column => (
            <TableBodyCell align={column.align} key={column.id}>
              <Skeleton height={CellSkeletonHeight} width='80%' />
            </TableBodyCell>
          ))}
          {rowsHaveActions ? <TableBodyCell align='center' /> : null}
        </TableBodyRow>
      ))}
    </TableBody>
  );
};
