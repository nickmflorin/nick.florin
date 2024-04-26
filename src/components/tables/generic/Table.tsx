"use client";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";

import clsx from "clsx";
import { type DataTableProps } from "mantine-datatable";

import { Loading } from "~/components/feedback/Loading";

import { type TableProps, TableSizes, type TableModel } from "../types";

const MantineDataTable = dynamic(() => import("mantine-datatable").then(i => i.DataTable), {
  loading: () => <Loading isLoading={true} />,
}) as {
  <T>(props: DataTableProps<T>): JSX.Element;
};

export const Table = memo(
  <T extends TableModel>({
    size = TableSizes.SM,
    columns,
    data,
    className,
    isLoading,
    ...props
  }: TableProps<T>) => {
    /* Mantine's <DataTable /> component defines the props as a set of base props intersected with a
     bunch of supplementary props, such as 'DataTableEmptyStateProps', each of which is a union
     type.  This introduces typing issues when adding our own props into the fold, because the
     intersection of our props with their props does not distribute our props over the union
     types.

     The only ways around this are to define the props for this component in an extremely
     complicated manner, or simply coerce the props as shown below. */
    const rootProps: DataTableProps<T> = useMemo(
      () =>
        ({
          highlightOnHover: false,
          height: "100%",
          className: clsx("data-table", `data-table--size-${size}`, className),
          customLoader: <Loading overlay={true} isLoading={true} />,
          // TODO: Revisit this later.
          emptyState: <></>,
          ...props,
          fetching: isLoading,
          records: data,
          columns,
        }) as DataTableProps<T>,
      [columns, data, props, isLoading, className, size],
    );

    return <MantineDataTable<T> {...rootProps} />;
  },
) as {
  <T extends TableModel>(props: TableProps<T>): JSX.Element;
};

export default Table;
