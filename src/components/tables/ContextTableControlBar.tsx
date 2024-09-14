"use client";
import { memo } from "react";

import { ShowHide } from "~/components/util";

import { ColumnSelect } from "./ColumnSelect";
import { useTableView } from "./hooks";
import { TableControlBar, type TableControlBarProps } from "./TableControlBar";

export interface ContextTableControlBarProps extends TableControlBarProps {}

export const ContextTableControlBar = memo(
  ({ children, ...props }: ContextTableControlBarProps) => {
    const { canToggleColumnVisibility } = useTableView();
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
  },
);
