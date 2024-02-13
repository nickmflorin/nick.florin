"use client";
import dynamic from "next/dynamic";

import clsx from "clsx";
import { type DataTableProps } from "mantine-datatable";

import { Loading } from "~/components/views/Loading";

import { type TableProps, TableSizes } from "./types";

const MantineDataTable = dynamic(() => import("mantine-datatable").then(i => i.DataTable)) as {
  <T>(props: DataTableProps<T>): JSX.Element;
};

export const Table = <T extends { id: string }>({
  size = TableSizes.SM,
  columns,
  data,
  className,
  loading,
  ...props
}: TableProps<T>) => {
  /* Mantine's <DataTable /> component defines the props as a set of base props intersected with a
     bunch of supplementary props, such as 'DataTableEmptyStateProps', each of which is a union
     type.  This introduces typing issues when adding our own props into the fold, because the
     intersection of our props with their props does not distribute our props over the union types.
     The only ways around this are to define the props for this component in an extremely
     complicated manner, or simply coerce the props as shown below. */
  const rootProps: DataTableProps<T> = {
    highlightOnHover: false,
    withBorder: false,
    height: "100%",
    className: clsx("data-table", `data-table--size-${size}`, className),
    customLoader: <Loading overlay={true} loading={true} />,
    // TODO: Revisit this later.
    emptyState: <></>,
    ...props,
    fetching: loading,
    records: data,
    columns,
  } as DataTableProps<T>;

  return <MantineDataTable<T> {...rootProps} />;
};

export default Table;
