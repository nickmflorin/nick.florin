"use client";
import { forwardRef, type ForwardedRef, useMemo } from "react";

import { Checkbox } from "~/components/input/Checkbox";

import { useTableView } from "./hooks";
import { RootTable } from "./RootTable";
import { type TableModel, type TableProps, type TableInstance, type Column } from "./types";

export const Table = forwardRef(
  <T extends TableModel>(
    { columns: _columns, ...props }: TableProps<T>,
    ref?: ForwardedRef<TableInstance<T>>,
  ) => {
    const { isCheckable, checked, check, uncheck } = useTableView();

    const columns = useMemo(() => {
      let cs: Column<T>[] = [..._columns];
      if (isCheckable) {
        cs = [
          {
            id: "checkable",
            title: "",
            accessor: "checkable",
            width: "40px",
            cellsClassName: "loading-cell",
            render: ({ model }) => (
              <div className="flex flex-row items-center justify-center">
                <Checkbox
                  value={checked.includes(model.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      check?.(model);
                    } else {
                      uncheck?.(model.id);
                    }
                  }}
                />
              </div>
            ),
          },
          ...cs,
        ];
      }
      return cs.map(col => ({ noWrap: true, ...col }));
    }, [_columns, checked, check, uncheck]);

    return <RootTable<T> {...props} ref={ref} columns={columns} />;
  },
) as {
  <T extends TableModel>(
    props: TableProps<T> & { readonly ref?: ForwardedRef<TableInstance<T>> },
  ): JSX.Element;
};

export default Table;
