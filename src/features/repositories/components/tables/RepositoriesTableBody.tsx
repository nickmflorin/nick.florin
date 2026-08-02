'use client';
import { type JSX } from 'react';

import {
  ConnectedDataTableBody,
  type ConnectedDataTableBodyProps,
} from '~/components/tables/data-tables/ConnectedDataTableBody';
import { type RepositoriesTableColumn, type RepositoriesTableModel } from '~/features/repositories';

import { useRepositoriesTableColumnProperties } from './hooks/use-column-properties';
import { useRepositoriesTableRowActions } from './hooks/use-row-actions';
import { RepositoriesTableControlBar } from './RepositoriesTableControlBar';

export interface RepositoriesTableBodyProps extends Omit<
  ConnectedDataTableBodyProps<RepositoriesTableModel, RepositoriesTableColumn>,
  'columnProperties' | 'columns' | 'getRowActions' | 'onRowSelected' | 'rowIsSelected'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const RepositoriesTableBody = ({
  areControlBarTooltipsInPortal,
  ...props
}: RepositoriesTableBodyProps): JSX.Element => {
  const columnProperties = useRepositoriesTableColumnProperties();
  const rowActions = useRepositoriesTableRowActions();

  return (
    <>
      <RepositoriesTableControlBar
        areTooltipsInPortal={areControlBarTooltipsInPortal}
        data={props.data}
        isDisabled={props.isEmpty}
      />
      <ConnectedDataTableBody<RepositoriesTableModel, RepositoriesTableColumn>
        emptyContent='There are no repositories.'
        noResultsContent='No repositories found for search criteria.'
        shouldPerformSelectionWhenClicked
        {...props}
        columnProperties={columnProperties}
        getRowActions={(experience, { setIsOpen }) =>
          rowActions(experience, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};
