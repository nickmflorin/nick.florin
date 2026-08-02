'use client';
import { type JSX } from 'react';

import {
  ConnectedDataTableBody,
  type ConnectedDataTableBodyProps,
} from '~/components/tables/data-tables/ConnectedDataTableBody';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills';

import { useSkillsTableColumnProperties } from './hooks/use-column-properties';
import { useSkillsTableRowActions } from './hooks/use-row-actions';
import { SkillsTableControlBar } from './SkillsTableControlBar';

export interface SkillsTableBodyProps extends Omit<
  ConnectedDataTableBodyProps<SkillsTableModel, SkillsTableColumn>,
  'columnProperties' | 'columns' | 'getRowActions' | 'onRowSelected' | 'rowIsSelected'
> {
  readonly areControlBarTooltipsInPortal?: boolean;
}

export const SkillsTableBody = ({
  areControlBarTooltipsInPortal,
  ...props
}: SkillsTableBodyProps): JSX.Element => {
  const columnProperties = useSkillsTableColumnProperties();
  const rowActions = useSkillsTableRowActions();

  return (
    <>
      <SkillsTableControlBar
        areTooltipsInPortal={areControlBarTooltipsInPortal}
        data={props.data}
        isDisabled={props.isEmpty}
      />
      <ConnectedDataTableBody<SkillsTableModel, SkillsTableColumn>
        emptyContent='There are no skills.'
        noResultsContent='No skills found for search criteria.'
        shouldPerformSelectionWhenClicked
        {...props}
        columnProperties={columnProperties}
        getRowActions={(skill, { setIsOpen }) =>
          rowActions(skill, { close: e => setIsOpen(false, e) })
        }
      />
    </>
  );
};
