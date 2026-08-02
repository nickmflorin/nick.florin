'use client';
import { type JSX } from 'react';

import {
  ConnectedDataTableBody,
  type ConnectedDataTableBodyProps,
} from '~/components/tables/data-tables/ConnectedDataTableBody';
import { type ExperiencesTableColumn, type ExperiencesTableModel } from '~/features/experiences';

import { ExperiencesTableControlBar } from './ExperiencesTableControlBar';
import { useExperiencesTableColumnProperties } from './hooks/use-column-properties';
import { useExperiencesTableRowActions } from './hooks/use-row-actions';

export interface ExperiencesTableBodyProps extends Omit<
  ConnectedDataTableBodyProps<ExperiencesTableModel, ExperiencesTableColumn>,
  'columnProperties' | 'columns' | 'getRowActions' | 'onRowSelected' | 'rowIsSelected'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const ExperiencesTableBody = ({
  areControlBarTooltipsInPortal,
  ...props
}: ExperiencesTableBodyProps): JSX.Element => {
  const columnProperties = useExperiencesTableColumnProperties();
  const rowActions = useExperiencesTableRowActions();

  return (
    <>
      <ExperiencesTableControlBar
        areTooltipsInPortal={areControlBarTooltipsInPortal}
        data={props.data}
        isDisabled={props.isEmpty}
      />
      <ConnectedDataTableBody<ExperiencesTableModel, ExperiencesTableColumn>
        emptyContent='There are no experiences.'
        noResultsContent='No experiences found for search criteria.'
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
