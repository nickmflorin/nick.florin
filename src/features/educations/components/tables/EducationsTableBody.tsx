'use client';
import { type JSX } from 'react';

import {
  ConnectedDataTableBody,
  type ConnectedDataTableBodyProps,
} from '~/components/tables/data-tables/ConnectedDataTableBody';
import { type EducationsTableColumn, type EducationsTableModel } from '~/features/educations';

import { EducationsTableControlBar } from './EducationsTableControlBar';
import { useEducationsTableColumnProperties } from './hooks/use-column-properties';
import { useEducationsTableRowActions } from './hooks/use-row-actions';

export interface EducationsTableBodyProps extends Omit<
  ConnectedDataTableBodyProps<EducationsTableModel, EducationsTableColumn>,
  'columnProperties' | 'columns' | 'getRowActions' | 'onRowSelected' | 'rowIsSelected'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const EducationsTableBody = ({
  areControlBarTooltipsInPortal,
  ...props
}: EducationsTableBodyProps): JSX.Element => {
  const columnProperties = useEducationsTableColumnProperties();
  const rowActions = useEducationsTableRowActions();

  return (
    <>
      <EducationsTableControlBar
        areTooltipsInPortal={areControlBarTooltipsInPortal}
        data={props.data}
        isDisabled={props.isEmpty}
      />
      <ConnectedDataTableBody<EducationsTableModel, EducationsTableColumn>
        emptyContent='There are no educations.'
        noResultsContent='No educations found for search criteria.'
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
