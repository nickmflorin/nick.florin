"use client";
import { ShowHide } from "~/components/util";

import { ColumnSelect } from "./ColumnSelect";
import { useTableView } from "./hooks";
import { TableControlBar, type TableControlBarProps } from "./TableControlBar";
import { type TableModel } from "./types";

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
