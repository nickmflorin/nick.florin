"use client";
import { ShowHide } from "~/components/util";

import { useTableView } from "../hooks";
import { type TableModel } from "../types";

import { ColumnSelect } from "./ColumnSelect";
import { TableControlBar, type TableControlBarProps } from "./TableControlBar";

export interface ContextTableControlBarProps extends TableControlBarProps {}

export const ContextTableControlBar = <T extends TableModel>({
  children,
  ...props
}: ContextTableControlBarProps) => {
  const { canToggleColumnVisibility } = useTableView<T>();
  return (
    <TableControlBar {...props}>
      <>
        {children}
        <ShowHide show={canToggleColumnVisibility}>
          <ColumnSelect />
        </ShowHide>
      </>
    </TableControlBar>
  );
};
