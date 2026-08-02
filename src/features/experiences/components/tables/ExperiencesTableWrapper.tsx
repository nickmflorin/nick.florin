import { type ReactNode, Suspense } from 'react';

import { DataTableProvider } from '~/components/tables/DataTableProvider';
import { type ExperiencesTableColumnId, ExperiencesTableColumns } from '~/features/experiences';

import { ExperiencesDataTableWrapper } from './ExperiencesDataTableWrapper';

export interface ExperiencesTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ExperiencesTableColumnId[];
}

export const ExperiencesTableWrapper = ({ children, ...props }: ExperiencesTableWrapperProps) => (
  <DataTableProvider
    areRowsDeletable
    areRowsSelectable
    columns={ExperiencesTableColumns}
    controlBarTargetId='experiences-admin-table-control-bar'
    hasRowActions
  >
    <Suspense fallback={null}>
      <ExperiencesDataTableWrapper {...props}>{children}</ExperiencesDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
