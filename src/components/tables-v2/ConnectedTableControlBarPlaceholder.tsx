"use client";
import { ConnectedColumnSelect } from "./ConnectedColumnSelect";
import { useDataTable } from "./hooks";
import {
  TableControlBarPlaceholder,
  type TableControlBarPlaceholderProps,
} from "./TableControlBarPlaceholder";

export interface ConnectedTableControlBarPlaceholderProps
  extends Omit<TableControlBarPlaceholderProps, "canDeleteRows" | "targetId"> {}

export const ConnectedTableControlBarPlaceholder = (
  props: ConnectedTableControlBarPlaceholderProps,
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
