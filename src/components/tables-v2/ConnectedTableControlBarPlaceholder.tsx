"use client";
import { ConnectedColumnSelect } from "./ConnectedColumnSelect";
import { useDataTable } from "./hooks";
import {
  TableControlBarPlaceholder,
  type TableControlBarPlaceholderProps,
} from "./TableControlBarPlaceholder";

export interface ConnectedTableControlPlaceholderBarProps
  extends Omit<TableControlBarPlaceholderProps, "canDeleteRows" | "targetId"> {}

export const ConnectedTableControlPlaceholderBar = (
  props: ConnectedTableControlPlaceholderBarProps,
): JSX.Element => {
  const { controlBarTargetId, rowsAreDeletable } = useDataTable();

  return (
    <TableControlBarPlaceholder
      {...props}
      targetId={controlBarTargetId}
      rowsAreDeletable={rowsAreDeletable}
      columnsSelect={<ConnectedColumnSelect />}
    />
  );
};
