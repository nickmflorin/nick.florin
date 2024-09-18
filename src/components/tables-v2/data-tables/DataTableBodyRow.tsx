import { type FloatingContentRenderProps } from "~/components/floating";
import type { TableBodyRowProps } from "~/components/tables-v2/generic/TableBodyRow";
import { TableBodyRow } from "~/components/tables-v2/generic/TableBodyRow";
import type * as types from "~/components/tables-v2/types";

import { ActionsCell, type ActionsCellProps } from "../cells/ActionsCell";
import { SelectCell } from "../cells/SelectCell";
import { TableBodyCell } from "../generic/TableBodyCell";

import { DataTableBodyCell } from "./DataTableBodyCell";

export interface DataTableBodyRowProps<D extends types.DataTableDatum, I extends string = string>
  extends Omit<TableBodyRowProps, "children"> {
  readonly datum: D;
  readonly columns: types.DataTableColumn<D, I>[];
  readonly actionMenuWidth?: ActionsCellProps["menuWidth"];
  readonly excludeColumns?: I[];
  readonly rowIsSelected?: (datum: D) => boolean;
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
  readonly getRowActions?: (
    datum: D,
    params: Pick<FloatingContentRenderProps, "setIsOpen">,
  ) => types.DataTableRowAction[];
}

export const DataTableBodyRow = <D extends types.DataTableDatum, I extends string>({
  datum,
  columns,
  actionMenuWidth,
  excludeColumns = [],
  onRowSelected,
  rowIsSelected,
  getRowActions,
  ...props
}: DataTableBodyRowProps<D, I>): JSX.Element => (
  <TableBodyRow {...props}>
    {rowIsSelected && (
      <TableBodyCell align="center">
        <SelectCell
          isSelected={rowIsSelected(datum)}
          onSelect={checked => onRowSelected?.(datum, checked)}
        />
      </TableBodyCell>
    )}
    {columns
      .filter(col => !excludeColumns.includes(col.id))
      .map(col => (
        <DataTableBodyCell<D, I> key={`${col.id}-${datum.id}`} column={col} datum={datum} />
      ))}
    {getRowActions && (
      <TableBodyCell align="center">
        <ActionsCell menuWidth={actionMenuWidth} actions={params => getRowActions(datum, params)} />
      </TableBodyCell>
    )}
  </TableBodyRow>
);
