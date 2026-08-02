'use client';
import { type JSX } from 'react';

import {
  ConnectedDataTableBody,
  type ConnectedDataTableBodyProps,
} from '~/components/tables/data-tables/ConnectedDataTableBody';
import { type CoursesTableColumn, type CoursesTableModel } from '~/features/courses';

import { CoursesTableControlBar } from './CoursesTableControlBar';
import { useCoursesTableColumnProperties } from './hooks/use-column-properties';
import { useCoursesTableRowActions } from './hooks/use-row-actions';

export interface CoursesTableBodyProps extends Omit<
  ConnectedDataTableBodyProps<CoursesTableModel, CoursesTableColumn>,
  'columnProperties' | 'columns' | 'getRowActions' | 'onRowSelected' | 'rowIsSelected'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const CoursesTableBody = ({
  areControlBarTooltipsInPortal,
  ...props
}: CoursesTableBodyProps): JSX.Element => {
  const columnProperties = useCoursesTableColumnProperties();
  const rowActions = useCoursesTableRowActions();

  return (
    <>
      <CoursesTableControlBar
        areTooltipsInPortal={areControlBarTooltipsInPortal}
        data={props.data}
        isDisabled={props.isEmpty}
      />
      <ConnectedDataTableBody<CoursesTableModel, CoursesTableColumn>
        emptyContent='There are no courses.'
        noResultsContent='No courses found for search criteria.'
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
