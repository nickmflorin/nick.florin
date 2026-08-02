'use client';
import { type ReactNode } from 'react';

import { ExperiencesDefaultOrdering } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableWrapper } from '~/components/tables/data-tables/ConnectedDataTableWrapper';
import {
  type ExperiencesTableColumn,
  type ExperiencesTableColumnId,
  ExperiencesTableColumns,
  type ExperiencesTableModel,
  type ExperiencesTableOrderableColumnId,
} from '~/features/experiences';
import { useOrdering } from '~/hooks/use-ordering';

export interface ExperiencesDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ExperiencesTableColumnId[];
}

export const ExperiencesDataTableWrapper = ({
  children,
  excludeColumns,
}: ExperiencesDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<ExperiencesTableOrderableColumnId>({
    defaultOrdering: ExperiencesDefaultOrdering,
    fields: [...ExperiencesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    useQueryParams: true,
  });
  return (
    <ConnectedDataTableWrapper<ExperiencesTableModel, ExperiencesTableColumn>
      excludeColumns={excludeColumns}
      onSort={(e, col) => setOrdering({ field: col.id })}
      ordering={ordering}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
