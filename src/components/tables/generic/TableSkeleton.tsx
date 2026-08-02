import { type ReactNode } from 'react';

import { TableBody, type TableBodyProps } from '~/components/tables/generic/TableBody';
import { type QuantitativeSize } from '~/components/types';

import { TableBodyCell } from './TableBodyCell';
import { TableBodyRow } from './TableBodyRow';

interface BaseTableSkeletonProps {
  readonly cellSkeletons?: ReactNode[];
  readonly numColumns?: number;
  readonly numRows?: number;
  readonly rowHeight?: QuantitativeSize<'px'>;
}

/* A plain '<div className="skeleton" />' is used as the fallback skeleton for each cell because no
   'skeleton' class name or component exists in the design system yet; this avoids depending on
   '@mui' for skeletons anywhere in the application. */
const TableSkeletonInner = ({
  cellSkeletons,
  numColumns = 5,
  numRows = 25,
  rowHeight,
}: BaseTableSkeletonProps) => (
  <>
    {new Array(numRows).fill('').map((e, i) => (
      <TableBodyRow height={rowHeight} key={i} tabIndex={-1}>
        {(cellSkeletons ?? new Array(numColumns).fill(<div className='skeleton' />)).map(
          (skeleton, j) => (
            <TableBodyCell key={j}>{skeleton}</TableBodyCell>
          ),
        )}
      </TableBodyRow>
    ))}
  </>
);

export interface TableSkeletonBodyProps
  extends BaseTableSkeletonProps, Omit<TableBodyProps, 'children'> {
  readonly component?: 'tbody';
}

export interface TableSkeletonFragmentProps extends BaseTableSkeletonProps {
  readonly component: 'fragment';
}

export type TableSkeletonProps = TableSkeletonBodyProps | TableSkeletonFragmentProps;

export const TableSkeleton = ({
  cellSkeletons,
  component,
  numColumns,
  numRows = 25,
  rowHeight,
  ...props
}: TableSkeletonProps) =>
  component === 'tbody' ? (
    <TableBody {...props}>
      <TableSkeletonInner
        cellSkeletons={cellSkeletons}
        numColumns={numColumns}
        numRows={numRows}
        rowHeight={rowHeight}
      />
    </TableBody>
  ) : (
    <TableSkeletonInner
      cellSkeletons={cellSkeletons}
      numColumns={numColumns}
      numRows={numRows}
      rowHeight={rowHeight}
    />
  );
