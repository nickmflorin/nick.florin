import { type FloatingContentRenderProps } from "~/components/floating";
import Spinner from "~/components/icons/Spinner";
import type { TableBodyRowProps } from "~/components/tables-v2/generic/TableBodyRow";
import { TableBodyRow } from "~/components/tables-v2/generic/TableBodyRow";
import type * as types from "~/components/tables-v2/types";

import { ActionsCell, type ActionsCellProps } from "../cells/ActionsCell";
import { RowSelectCell } from "../cells/RowSelectCell";
import { TableBodyCell } from "../generic/TableBodyCell";

import { DataTableBodyCell } from "./DataTableBodyCell";

export interface DataTableBodyRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableBodyRowProps, "children"> {
  readonly datum: D;
  readonly columns: types.DataTableColumn<D, C>[];
  readonly actionMenuWidth?: ActionsCellProps["menuWidth"];
  readonly excludeColumns?: types.TableColumnId<C>[];
  readonly isSelected?: boolean;
  readonly performSelectionWhenClicked?: boolean;
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
  readonly getRowActions?: (
    datum: D,
    params: Pick<FloatingContentRenderProps, "setIsOpen">,
  ) => types.DataTableRowAction[];
}

export const DataTableBodyRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  datum,
  columns,
  actionMenuWidth,
  excludeColumns = [],
  isSelected,
  performSelectionWhenClicked = false,
  onRowSelected,
  getRowActions,
  ...props
}: DataTableBodyRowProps<D, C>): JSX.Element => (
  <TableBodyRow
    {...props}
    onClick={e => {
      e.stopPropagation();
      if (performSelectionWhenClicked) {
        onRowSelected?.(datum, !isSelected);
      }
      props.onClick?.(e);
    }}
  >
    {isSelected === undefined && (
      <TableBodyCell align="center" className="loading-cell p-0">
        <div className="flex flex-col h-full w-full justify-center items-center">
          <Spinner isLoading={props.isLoading} size="18px" />
        </div>
      </TableBodyCell>
    )}
    {isSelected !== undefined && (
      <TableBodyCell align="center" className="loading-cell select-cell p-0">
        <div className="flex flex-col h-full w-full justify-center items-center">
          {props.isLoading ? (
            <Spinner isLoading={props.isLoading} size="18px" />
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
        <DataTableBodyCell<D, C> key={`${col.id}-${datum.id}`} column={col} datum={datum} />
      ))}
    {getRowActions && (
      <TableBodyCell align="center">
        <ActionsCell menuWidth={actionMenuWidth} actions={params => getRowActions(datum, params)} />
      </TableBodyCell>
    )}
  </TableBodyRow>
);
