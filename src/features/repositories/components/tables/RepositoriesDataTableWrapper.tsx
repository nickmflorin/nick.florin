'use client';
import { type ReactNode } from 'react';

import { RepositoriesDefaultOrdering } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableWrapper } from '~/components/tables/data-tables/ConnectedDataTableWrapper';
import {
  type RepositoriesTableColumn,
  type RepositoriesTableColumnId,
  RepositoriesTableColumns,
  type RepositoriesTableModel,
  type RepositoriesTableOrderableColumnId,
} from '~/features/repositories';
import { useOrdering } from '~/hooks/use-ordering';

export interface RepositoriesDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: RepositoriesTableColumnId[];
}

export const RepositoriesDataTableWrapper = ({
  children,
  excludeColumns,
}: RepositoriesDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<RepositoriesTableOrderableColumnId>({
    defaultOrdering: RepositoriesDefaultOrdering,
    fields: [...RepositoriesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    useQueryParams: true,
  });
  return (
    <ConnectedDataTableWrapper<RepositoriesTableModel, RepositoriesTableColumn>
      excludeColumns={excludeColumns}
      onSort={(e, col) => setOrdering({ field: col.id })}
      ordering={ordering}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
