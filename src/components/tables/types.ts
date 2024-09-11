import { type ReactNode } from "react";

import { enumeratedLiterals, type EnumeratedLiteralsMember } from "enumerated-literals";
import { omit } from "lodash-es";
import { type DataTableColumn, type DataTableRowExpansionProps } from "mantine-datatable";

import { classNames } from "~/components/types";
import { type ClassName, type ComponentProps } from "~/components/types";

export type RootColumn<T extends TableModel> = Omit<DataTableColumn<T>, "id" | "accessor"> & {
  readonly id?: string;
  readonly accessor: string;
};

export type TableModel = {
  readonly id: string;
};

export type CellTableInstance<T extends TableModel> = Pick<TableView<T>, "setRowLoading">;

export type CellRenderProps<T extends TableModel> = {
  readonly model: T;
  readonly index: number;
  /* It is important that the table instance that is passed to the cells does not include the
     columns, otherwise, it can lead to an infinite recursion as the cells are a part of the
     columns. */
  readonly table: CellTableInstance<T>;
};

export type CellRenderer<T extends TableModel> = (props: CellRenderProps<T>) => ReactNode;

export type Column<T extends TableModel> = Omit<RootColumn<T>, "render"> & {
  readonly defaultVisible?: boolean;
  readonly isHideable?: boolean;
  readonly render?: CellRenderer<T>;
};

export const getColId = <T extends TableModel>(col: Column<T>): string => col.id ?? col.accessor;

export const toNativeColumn = <T extends TableModel>(
  col: Column<T>,
  table: CellTableInstance<T>,
): RootColumn<T> => {
  const { render } = col;
  if (render !== undefined) {
    return {
      ...omit(col, ["id", "render", "defaultVisible", "isHideable"]),
      render: (model: T, index: number) => render({ model, index, table }),
    } as RootColumn<T>;
  }
  return col as RootColumn<T>;
};

export const TableSizes = enumeratedLiterals(["sm", "md", "lg"] as const, {});
export type TableSize = EnumeratedLiteralsMember<typeof TableSizes>;

export type RowClassNameFn<T extends TableModel> = (record: T, index: number) => ClassName;
export type RowClassName<T extends TableModel> = ClassName | RowClassNameFn<T>;

export interface TableProps<T extends TableModel> extends ComponentProps {
  readonly data: T[];
  readonly columns: RootColumn<T>[];
  readonly size?: TableSize;
  readonly isLoading?: boolean;
  readonly rowClassName?: RowClassName<T>;
  readonly rowExpansion?: DataTableRowExpansionProps<T>;
  readonly noHeader?: boolean;
}

export interface ContextTableProps<T extends TableModel> extends Omit<TableProps<T>, "columns"> {
  readonly columns: Column<T>[];
}

export const mergeRowClassNames =
  <T extends TableModel>(...cs: (RowClassName<T> | undefined)[]): RowClassNameFn<T> =>
  (record, index) =>
    cs.reduce((prev: ClassName, curr: RowClassName<T>) => {
      if (typeof curr === "function") {
        return classNames(prev, curr(record, index));
      } else {
        return classNames(prev, curr);
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
  readonly rowIsLoading: (id: T["id"]) => boolean;
  readonly rowIsLocked: (id: T["id"]) => boolean;
  readonly setRowLoading: (id: T["id"], loading: boolean, opts?: { locked?: boolean }) => void;
  readonly hideColumn: (id: string) => void;
  readonly showColumn: (id: string) => void;
  readonly check: (m: T | T["id"]) => void;
  readonly uncheck: (m: T["id"]) => void;
  readonly setVisibleColumns: (m: string[]) => void;
};

export type ContextTableComponent = {
  <T extends TableModel>(props: Omit<TableProps<T>, "columns">): JSX.Element;
};
