import { type ReactNode, Suspense } from 'react';

import { DataTableProvider } from '~/components/tables/DataTableProvider';
import { type RepositoriesTableColumnId, RepositoriesTableColumns } from '~/features/repositories';

import { RepositoriesDataTableWrapper } from './RepositoriesDataTableWrapper';

export interface RepositoriesTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: RepositoriesTableColumnId[];
}

export const RepositoriesTableWrapper = ({ children, ...props }: RepositoriesTableWrapperProps) => (
  <DataTableProvider
    areRowsDeletable
    areRowsSelectable
    columns={RepositoriesTableColumns}
    controlBarTargetId='repositories-admin-table-control-bar'
    hasRowActions
  >
    <Suspense fallback={null}>
      <RepositoriesDataTableWrapper {...props}>{children}</RepositoriesDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
