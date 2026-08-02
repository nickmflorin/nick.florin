'use client';
import { type ReactNode } from 'react';

import { SkillsDefaultOrdering } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableWrapper } from '~/components/tables/data-tables/ConnectedDataTableWrapper';
import {
  type SkillsTableColumn,
  type SkillsTableColumnId,
  SkillsTableColumns,
  type SkillsTableModel,
  type SkillsTableOrderableColumnId,
} from '~/features/skills';
import { useOrdering } from '~/hooks/use-ordering';

export interface SkillsDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: SkillsTableColumnId[];
}

export const SkillsDataTableWrapper = ({
  children,
  excludeColumns,
}: SkillsDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<SkillsTableOrderableColumnId>({
    defaultOrdering: SkillsDefaultOrdering,
    fields: [...SkillsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    useQueryParams: true,
  });
  return (
    <ConnectedDataTableWrapper<SkillsTableModel, SkillsTableColumn>
      excludeColumns={excludeColumns}
      onSort={(e, col) => setOrdering({ field: col.id })}
      ordering={ordering}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
