'use client';
import dynamic from 'next/dynamic';
import { type ComponentType, type JSX, type ReactNode, useState } from 'react';

import type * as types from './types';

import { type MutationActionResponse } from '~/actions';

import { DeleteButton } from '~/components/buttons/DeleteButton';
import { Tooltip } from '~/components/floating/Tooltip';
import { Checkbox } from '~/components/input/Checkbox';
import { type Action, Actions } from '~/components/structural/Actions';
import { ColumnSelect } from '~/components/tables/ColumnSelect';
import { classNames, type ComponentProps } from '~/components/types';
import { Text } from '~/components/typography';

import { TableControlBarAction, type TableControlBarActionConfig } from './TableControlBarAction';
import { TableControlBarPortal } from './TableControlBarPortal';

const DeleteConfirmationDialog = dynamic(() =>
  import('~/components/dialogs/DeleteConfirmationDialog').then(mod => mod.DeleteConfirmationDialog),
);

interface TableControlBarDeleteConfirmationRenderProps<T> {
  readonly data: T[];
  readonly isOpen: boolean;
  readonly onCancel: () => void;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

const DefaultDeleteConfirmationModal = () => null;

export interface TableControlBarProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends ComponentProps {
  readonly actions?: TableControlBarActionConfig<D>[];
  readonly areAllRowsSelected?: boolean;
  readonly areRowsDeletable?: boolean;
  readonly areTooltipsInPortal?: boolean;
  readonly children?: ReactNode;
  readonly columns?: C[];
  readonly columnsSelect?: JSX.Element;
  readonly confirmationModal?:
    | ((props: TableControlBarDeleteConfirmationRenderProps<D>) => JSX.Element)
    | ComponentType<TableControlBarDeleteConfirmationRenderProps<D>>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly deleteAction?: (ids: string[]) => Promise<MutationActionResponse<any>>;
  readonly deleteTooltipContent?: ((numRows: number) => string) | string;
  readonly extra?: Action[];
  readonly isDisabled?: boolean;
  readonly modelName?: string;
  readonly onSelectAllRows?: (v: boolean) => void;
  readonly onVisibleColumnsChange?: (v: C['id'][]) => void;
  readonly selectedRows: D[];
  readonly targetId: null | string;
  readonly visibleColumns?: C['id'][];
}

export const TableControlBar = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  actions,
  areAllRowsSelected = false,
  areRowsDeletable = false,
  areTooltipsInPortal = false,
  children,
  columns,
  columnsSelect,
  confirmationModal = DefaultDeleteConfirmationModal,
  deleteAction,
  deleteTooltipContent = (numRows: number) => `Delete ${numRows} selected rows.`,
  extra,
  isDisabled = false,
  modelName,
  onSelectAllRows,
  onVisibleColumnsChange,
  selectedRows,
  targetId,
  visibleColumns,
  ...props
}: TableControlBarProps<D, C>): JSX.Element => {
  const [confirmationModalIsOpen, setConfirmationModalIsOpen] = useState(false);

  const ConfirmationModal = confirmationModal;

  return (
    <>
      <TableControlBarPortal targetId={targetId}>
        <div {...props} className={classNames('table-view__control-bar', props.className)}>
          <div className='table-view__control-bar__left'>
            <div className='table-view__control-bar__checkbox-wrapper'>
              <Checkbox
                isChecked={areAllRowsSelected}
                isDisabled={isDisabled}
                onChange={e => onSelectAllRows?.(e.target.checked)}
                readOnly
              />
            </div>
            <div className='table-view__control-bar-actions'>
              {areRowsDeletable && (
                <Tooltip
                  className='text-sm'
                  content={
                    typeof deleteTooltipContent === 'string'
                      ? deleteTooltipContent
                      : deleteTooltipContent(selectedRows.length)
                  }
                  isDisabled={selectedRows.length === 0 || isDisabled}
                  isInPortal={areTooltipsInPortal}
                  offset={{ mainAxis: 6 }}
                  placement='top-start'
                >
                  <DeleteButton
                    isDisabled={selectedRows.length === 0}
                    onClick={() => setConfirmationModalIsOpen(true)}
                  />
                </Tooltip>
              )}
              {actions !== undefined && actions.length !== 0 ? (
                actions.map((action, i) => (
                  <TableControlBarAction
                    {...action}
                    areTooltipsInPortal={areTooltipsInPortal}
                    isDisabled={isDisabled}
                    key={i}
                    rows={selectedRows}
                  />
                ))
              ) : (
                <>{children}</>
              )}
              {selectedRows.length === 0 ? null : (
                <Text fontWeight='medium'>
                  {selectedRows.length}{' '}
                  <Text component='span' fontWeight='regular'>
                    Selected Rows
                  </Text>
                </Text>
              )}
            </div>
          </div>
          <div className='table-view__control-bar__right'>
            {columnsSelect ??
              (columns === undefined ? null : (
                <ColumnSelect<D, C>
                  columns={columns}
                  onChange={onVisibleColumnsChange}
                  value={visibleColumns}
                />
              ))}
            <Actions>{extra}</Actions>
          </div>
        </div>
      </TableControlBarPortal>
      {confirmationModalIsOpen && selectedRows.length !== 0 && (
        <>
          {deleteAction ? (
            <DeleteConfirmationDialog
              action={deleteAction}
              data={selectedRows}
              isOpen
              modelName={modelName}
              onCancel={() => setConfirmationModalIsOpen(false)}
              onClose={() => setConfirmationModalIsOpen(false)}
              onSuccess={() => setConfirmationModalIsOpen(false)}
            />
          ) : (
            <ConfirmationModal
              data={selectedRows}
              isOpen
              onCancel={() => setConfirmationModalIsOpen(false)}
              onClose={() => setConfirmationModalIsOpen(false)}
              onSuccess={() => setConfirmationModalIsOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
};
