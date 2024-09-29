"use client";
import dynamic from "next/dynamic";
import { type ReactNode, useState } from "react";

import type * as types from "./types";

import { type MutationActionResponse } from "~/actions";

import { DeleteButton } from "~/components/buttons/DeleteButton";
import { Tooltip } from "~/components/floating/Tooltip";
import { Checkbox } from "~/components/input/Checkbox";
import { Actions, type Action } from "~/components/structural/Actions";
import { ColumnSelect } from "~/components/tables/ColumnSelect";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { Text } from "~/components/typography";

import { TableControlBarPortal } from "./TableControlBarPortal";

const DeleteConfirmationDialog = dynamic(() =>
  import("~/components/dialogs/DeleteConfirmationDialog").then(mod => mod.DeleteConfirmationDialog),
);

interface TableControlBarDeleteConfirmationRenderProps<T> {
  readonly isOpen: boolean;
  readonly data: T[];
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

const DefaultDeleteConfirmationModal = () => <></>;

export interface TableControlBarProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends ComponentProps {
  readonly children?: ReactNode;
  readonly tooltipsInPortal?: boolean;
  readonly allRowsAreSelected?: boolean;
  readonly isDisabled?: boolean;
  readonly selectedRows: D[];
  readonly rowsAreDeletable?: boolean;
  readonly targetId: string | null;
  readonly actions?: Action[];
  readonly deleteTooltipContent?: string | ((numRows: number) => string);
  readonly columnsSelect?: JSX.Element;
  readonly columns?: C[];
  readonly visibleColumns?: C["id"][];
  readonly modelName?: string;
  readonly onSelectAllRows?: (v: boolean) => void;
  readonly onVisibleColumnsChange?: (v: C["id"][]) => void;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly deleteAction?: (ids: string[]) => Promise<MutationActionResponse<any>>;
  readonly confirmationModal?:
    | React.ComponentType<TableControlBarDeleteConfirmationRenderProps<D>>
    | ((props: TableControlBarDeleteConfirmationRenderProps<D>) => JSX.Element);
}

export const TableControlBar = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  children,
  actions,
  allRowsAreSelected = false,
  tooltipsInPortal = false,
  selectedRows,
  targetId,
  isDisabled = false,
  rowsAreDeletable = false,
  confirmationModal = DefaultDeleteConfirmationModal,
  columns,
  visibleColumns,
  columnsSelect,
  modelName,
  deleteAction,
  onVisibleColumnsChange,
  deleteTooltipContent = (numRows: number) => `Delete ${numRows} selected rows.`,
  onSelectAllRows,
  ...props
}: TableControlBarProps<D, C>): JSX.Element => {
  const [confirmationModalIsOpen, setConfirmationModelIsOpen] = useState(false);

  const ConfirmationModal = confirmationModal;

  return (
    <>
      <TableControlBarPortal targetId={targetId}>
        <div {...props} className={classNames("table-view__control-bar", props.className)}>
          <div className="table-view__control-bar__left">
            <div className="table-view__control-bar__checkbox-wrapper">
              <Checkbox
                readOnly
                value={allRowsAreSelected}
                isDisabled={isDisabled}
                onChange={e => onSelectAllRows?.(e.target.checked)}
              />
            </div>
            <div className="table-view__control-bar-actions">
              {rowsAreDeletable && (
                <Tooltip
                  placement="top-start"
                  inPortal={tooltipsInPortal}
                  offset={{ mainAxis: 6 }}
                  content={
                    typeof deleteTooltipContent === "string"
                      ? deleteTooltipContent
                      : deleteTooltipContent(selectedRows.length)
                  }
                  className="text-sm"
                  isDisabled={selectedRows.length === 0 || isDisabled}
                >
                  <DeleteButton
                    isDisabled={selectedRows.length === 0}
                    onClick={() => setConfirmationModelIsOpen(true)}
                  />
                </Tooltip>
              )}
              {children}
              {selectedRows.length !== 0 ? (
                <Text fontWeight="medium">
                  {selectedRows.length}{" "}
                  <Text component="span" fontWeight="regular">
                    Selected Rows
                  </Text>
                </Text>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="table-view__control-bar__right">
            {columnsSelect ? (
              columnsSelect
            ) : columns !== undefined ? (
              <ColumnSelect<D, C>
                columns={columns}
                value={visibleColumns}
                onChange={onVisibleColumnsChange}
              />
            ) : (
              <></>
            )}
            <Actions>{actions}</Actions>
          </div>
        </div>
      </TableControlBarPortal>
      {confirmationModalIsOpen && selectedRows.length !== 0 && (
        <>
          {deleteAction ? (
            <DeleteConfirmationDialog
              isOpen
              modelName={modelName}
              action={deleteAction}
              data={selectedRows}
              onClose={() => setConfirmationModelIsOpen(false)}
              onCancel={() => setConfirmationModelIsOpen(false)}
              onSuccess={() => setConfirmationModelIsOpen(false)}
            />
          ) : (
            <ConfirmationModal
              isOpen
              data={selectedRows}
              onClose={() => setConfirmationModelIsOpen(false)}
              onCancel={() => setConfirmationModelIsOpen(false)}
              onSuccess={() => setConfirmationModelIsOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
};
