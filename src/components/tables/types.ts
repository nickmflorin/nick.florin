import { type ReactNode } from "react";

import clsx from "clsx";
import { type DataTableColumn } from "mantine-datatable";

import { enumeratedLiterals, type EnumeratedLiteralsType } from "~/lib/literals";
import { type ClassName, type ComponentProps } from "~/components/types";

export type TableModel = {
  readonly id: string;
};

export type TableInstance<T extends TableModel> = {
  readonly rowIsLoading: (id: T["id"]) => boolean;
  readonly setRowLoading: (id: T["id"], loading: boolean) => void;
};

export type ColumnRenderProps<T extends TableModel> = {
  readonly model: T;
  readonly index: number;
  readonly table: TableInstance<T>;
};

export interface Column<T extends TableModel> extends Omit<DataTableColumn, "render"> {
  readonly render?: (params: ColumnRenderProps<T>) => ReactNode;
}

export const TableSizes = enumeratedLiterals(["sm", "md", "lg"] as const, {});
export type TableSize = EnumeratedLiteralsType<typeof TableSizes>;

export type RowClassNameFn<T extends TableModel> = (record: T, index: number) => ClassName;
export type RowClassName<T extends TableModel> = ClassName | RowClassNameFn<T>;

export interface TableProps<T extends TableModel> extends ComponentProps {
  readonly data: T[];
  readonly columns: Column<T>[];
  readonly size?: TableSize;
  readonly loading?: boolean;
  readonly rowClassName?: RowClassName<T>;
  readonly isCheckable?: boolean;
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
