"use client";
import { forwardRef, type ForwardedRef, useMemo } from "react";

import { Checkbox } from "~/components/input/Checkbox";

import { RootTable } from "./RootTable";
import { type TableModel, type TableProps, type TableInstance } from "./types";

export const Table = forwardRef(
  <T extends TableModel>(
    { isCheckable, columns: _columns, ...props }: TableProps<T>,
    ref?: ForwardedRef<TableInstance<T>>,
  ) => {
    const columns = useMemo(() => {
      if (isCheckable) {
        return [
          {
            id: "checkable",
            title: "",
            accessor: "checkable",
            width: "40px",
            cellsClassName: "loading-cell",
            render: () => (
              <div className="flex flex-row items-center justify-center">
                <Checkbox value={false} readOnly />
              </div>
            ),
          },
          ..._columns,
        ];
      }
      return _columns;
    }, [_columns, isCheckable]);
    return <RootTable<T> {...props} ref={ref} columns={columns} />;
  },
) as {
  <T extends TableModel>(
    props: TableProps<T> & { readonly ref?: ForwardedRef<TableInstance<T>> },
  ): JSX.Element;
};

export default Table;
