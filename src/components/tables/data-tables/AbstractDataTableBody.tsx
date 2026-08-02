import { Fragment, type JSX, useMemo } from 'react';

import { type FloatingContentRenderProps } from '~/components/floating';
import { type ActionsCellProps } from '~/components/tables/cells/ActionsCell';
import { TableBody, type TableBodyProps } from '~/components/tables/generic/TableBody';
import * as types from '~/components/tables/types';
import { type ClassName, type QuantitativeSize } from '~/components/types';

import { type DataTableBodyRowProps } from './DataTableBodyRow';

export interface AbstractDataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableBodyProps, 'cellSkeletons' | 'children' | 'numSkeletonColumns'> {
  readonly actionMenuWidth?: ActionsCellProps['menuWidth'];
  readonly children: (
    props: Omit<DataTableBodyRowProps<D, C>, 'onRowSelected' | 'rowIsSelected'>,
  ) => JSX.Element;
  readonly columnProperties: types.DataTableColumnProperties<D, C>;
  readonly columns: C[];
  readonly data: D[];
  readonly excludeColumns?: types.TableColumnId<C>[];
  readonly getRowActions?: (
    datum: D,
    params: Pick<FloatingContentRenderProps, 'setIsOpen'>,
  ) => types.DataTableRowAction[];
  readonly isScrollable?: boolean;
  readonly onRowClick?: (id: string, datum: D) => void;
  readonly rowHeight?: QuantitativeSize<'px'>;
  readonly rowHoveredClassName?: ClassName;
  readonly shouldHighlightRowOnHover?: boolean;
}

export const AbstractDataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  actionMenuWidth,
  children,
  columnProperties,
  columns: _columns,
  data,
  excludeColumns = [],
  getRowActions,
  onRowClick,
  rowHeight,
  rowHoveredClassName,
  shouldHighlightRowOnHover,
  ...props
}: AbstractDataTableBodyProps<D, C>): JSX.Element => {
  const columns = useMemo(
    () => types.convertConfigsToColumns(_columns, columnProperties),
    [_columns, columnProperties],
  );
  return (
    <TableBody
      {...props}
      /* A plain '<div className="skeleton" />' is used as the fallback skeleton for each cell
         because no 'skeleton' class name or component exists in the design system yet; this
         avoids depending on '@mui' for skeletons anywhere in the application. */
      cellSkeletons={columns.map(
        ({ config: { skeleton } }, i) => skeleton ?? <div className='skeleton' key={i} />,
      )}
      skeletonRowHeight={props.skeletonRowHeight ?? rowHeight}
    >
      {data.map(datum => (
        <Fragment key={datum.id}>
          {children({
            actionMenuWidth,
            columns,
            datum,
            excludeColumns,
            getRowActions,
            height: rowHeight,
            hoveredClassName: rowHoveredClassName,
            onClick: () => onRowClick?.(datum.id, datum),
            shouldHighlightOnHover: shouldHighlightRowOnHover,
          })}
        </Fragment>
      ))}
    </TableBody>
  );
};
