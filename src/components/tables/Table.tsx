"use client";
import dynamic from "next/dynamic";
import {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from "react";

import clsx from "clsx";
import { type DataTableProps, type DataTableColumn } from "mantine-datatable";

import { Spinner } from "~/components/icons/Spinner";

import * as hooks from "./hooks";
import {
  type TableProps,
  TableSizes,
  type TableModel,
  type TableInstance,
  mergeRowClassNames,
} from "./types";

const MantineDataTable = dynamic(() => import("mantine-datatable").then(i => i.DataTable)) as {
  <T>(props: DataTableProps<T>): JSX.Element;
};

const Loading = dynamic(() => import("~/components/views/Loading").then(mod => mod.Loading), {
  ssr: false,
});

type RowLoadingState<T extends TableModel> = {
  readonly id: T["id"];
  readonly locked?: boolean;
};

export const Table = forwardRef(
  <T extends TableModel>(
    {
      size = TableSizes.SM,
      columns: _columns,
      data,
      className,
      isLoading,
      isCheckable,
      ...props
    }: TableProps<T>,
    ref?: ForwardedRef<TableInstance<T>>,
  ) => {
    const table = hooks.useTable(ref);
    const [rowStates, setRowStates] = useState<RowLoadingState<T>[]>([]);

    const setRowLoading = useCallback(
      (id: T["id"], value: boolean, opts?: { locked?: boolean }) => {
        setRowStates(curr => {
          if (value) {
            return [...curr.filter(st => st.id !== id), { id, locked: opts?.locked !== false }];
          }
          return [...curr.filter(st => st.id !== id)];
        });
      },
      [],
    );

    useImperativeHandle(table, () => ({
      rowIsLoading: (id: T["id"]) => rowStates.map(st => st.id).includes(id),
      setRowLoading,
    }));

    const columns = useMemo(() => {
      const cs: DataTableColumn<T>[] = [
        {
          title: "",
          accessor: "",
          width: "40px",
          cellsClassName: "loading-cell",
          render: (model: T) => (
            <div className="flex flex-row items-center justify-center">
              <Spinner size="18px" isLoading={rowStates.map(st => st.id).includes(model.id)} />
            </div>
          ),
        },
        ..._columns.map((col): DataTableColumn<T> => {
          const { render } = col;
          if (render !== undefined) {
            return {
              ...col,
              render: (model: T, index: number) => render({ model, index, table: table.current }),
            } as DataTableColumn<T>;
          }
          return col as DataTableColumn<T>;
        }),
      ];
      return cs;
    }, [_columns, table, rowStates]);

    /* Mantine's <DataTable /> component defines the props as a set of base props intersected with a
       bunch of supplementary props, such as 'DataTableEmptyStateProps', each of which is a union
       type.  This introduces typing issues when adding our own props into the fold, because the
       intersection of our props with their props does not distribute our props over the union
       types.

       The only ways around this are to define the props for this component in an extremely
       complicated manner, or simply coerce the props as shown below. */
    const rootProps: DataTableProps<T> = {
      highlightOnHover: false,
      height: "100%",
      className: clsx("data-table", `data-table--size-${size}`, className),
      customLoader: <Loading overlay={true} loading={true} />,
      // TODO: Revisit this later.
      emptyState: <></>,
      ...props,
      rowClassName: mergeRowClassNames(props.rowClassName, ({ id }) => {
        const loadingState = rowStates.find(st => st.id === id);
        if (loadingState) {
          return clsx("row--loading", { "row--locked": loadingState.locked });
        }
        return "";
      }),
      fetching: isLoading,
      records: data,
      columns,
    } as DataTableProps<T>;

    return <MantineDataTable<T> {...rootProps} />;
  },
) as {
  <T extends TableModel>(
    props: TableProps<T> & { readonly ref?: ForwardedRef<TableInstance<T>> },
  ): JSX.Element;
};

export default Table;
