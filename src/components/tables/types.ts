import { type ReactNode, type ForwardedRef } from "react";

import clsx from "clsx";
import omit from "lodash.omit";
import { type DataTableColumn, type DataTableRowExpansionProps } from "mantine-datatable";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import { type ClassName, type ComponentProps } from "~/components/types";

export type TableModel = {
  readonly id: string;
};

export type TableInstance<T extends TableModel> = {
  readonly rowIsLoading: (id: T["id"]) => boolean;
  readonly setRowLoading: (id: T["id"], loading: boolean, opts?: { locked?: boolean }) => void;
};

export type CellRenderProps<T extends TableModel> = {
  readonly model: T;
  readonly index: number;
  readonly table: TableInstance<T>;
};

export type CellRenderer<T extends TableModel> = (props: CellRenderProps<T>) => ReactNode;

export type Column<T extends TableModel> = Omit<DataTableColumn, "render"> & {
  readonly id?: string;
  readonly defaultVisible?: boolean;
  readonly isHideable?: boolean;
  readonly render?: CellRenderer<T>;
};

export const getColId = <T extends TableModel>(col: Column<T>): string => col.id ?? col.accessor;

export const toNativeColumn = <T extends TableModel>(
  col: Column<T>,
  table: TableInstance<T>,
): DataTableColumn<T> => {
  const { render } = col;
  if (render !== undefined) {
    return {
      ...omit(col, ["id", "render", "defaultVisible", "isHideable"]),
      render: (model: T, index: number) => render({ model, index, table }),
    } as DataTableColumn<T>;
  }
  return col as DataTableColumn<T>;
};

export const TableSizes = enumeratedLiterals(["sm", "md", "lg"] as const, {});
export type TableSize = EnumeratedLiteralsType<typeof TableSizes>;

export type RowClassNameFn<T extends TableModel> = (record: T, index: number) => ClassName;
export type RowClassName<T extends TableModel> = ClassName | RowClassNameFn<T>;

export interface TableProps<T extends TableModel> extends ComponentProps {
  readonly data: T[];
  readonly columns: Column<T>[];
  readonly size?: TableSize;
  readonly isLoading?: boolean;
  readonly rowClassName?: RowClassName<T>;
  readonly rowExpansion?: DataTableRowExpansionProps<T>;
  readonly noHeader?: boolean;
}

export const mergeRowClassNames =
  <T extends TableModel>(...classNames: (RowClassName<T> | undefined)[]): RowClassNameFn<T> =>
  (record, index) =>
    classNames.reduce((prev: ClassName, curr: RowClassName<T>) => {
      if (typeof curr === "function") {
        return clsx(prev, curr(record, index));
      } else {
        return clsx(prev, curr);
      }
    }, "");

export type TableView<T extends TableModel> = {
  readonly id: string;
  readonly isCheckable: boolean;
  readonly canToggleColumnVisibility: boolean;
  readonly isReady: boolean;
  readonly checked: T["id"][];
  readonly columns: Column<T>[];
  readonly visibleColumns: Column<T>[];
  readonly visibleColumnIds: string[];
  readonly hideColumn: (id: string) => void;
  readonly showColumn: (id: string) => void;
  readonly check: (m: T | T["id"]) => void;
  readonly uncheck: (m: T["id"]) => void;
  readonly setVisibleColumns: (m: string[]) => void;
};

export type ContextTableComponent = {
  <T extends TableModel>(
    props: Omit<TableProps<T>, "columns"> & { readonly ref?: ForwardedRef<TableInstance<T>> },
  ): JSX.Element;
};
