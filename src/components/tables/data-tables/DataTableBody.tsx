import { type JSX } from 'react';

import type * as types from '~/components/tables/types';

import { AbstractDataTableBody, type AbstractDataTableBodyProps } from './AbstractDataTableBody';
import { DataTableBodyRow } from './DataTableBodyRow';

export interface DataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<AbstractDataTableBodyProps<D, C>, 'children'> {
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
  readonly rowIsSelected?: (datum: D['id']) => boolean;
  readonly shouldPerformSelectionWhenClicked?: boolean;
}

export const DataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  onRowSelected,
  rowIsSelected,
  shouldPerformSelectionWhenClicked,
  ...props
}: DataTableBodyProps<D, C>): JSX.Element => (
  <AbstractDataTableBody {...props}>
    {ps => (
      <DataTableBodyRow<D, C>
        {...ps}
        isSelected={rowIsSelected?.(ps.datum.id)}
        onRowSelected={onRowSelected}
        shouldPerformSelectionWhenClicked={shouldPerformSelectionWhenClicked}
      />
    )}
  </AbstractDataTableBody>
);
