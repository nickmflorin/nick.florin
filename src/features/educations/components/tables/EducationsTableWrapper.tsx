import { type ReactNode, Suspense } from 'react';

import { DataTableProvider } from '~/components/tables/DataTableProvider';
import { type EducationsTableColumnId, EducationsTableColumns } from '~/features/educations';

import { EducationsDataTableWrapper } from './EducationsDataTableWrapper';

export interface EducationsTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: EducationsTableColumnId[];
}

export const EducationsTableWrapper = ({ children, ...props }: EducationsTableWrapperProps) => (
  <DataTableProvider
    areRowsDeletable
    areRowsSelectable
    columns={EducationsTableColumns}
    controlBarTargetId='educations-admin-table-control-bar'
    hasRowActions
  >
    <Suspense fallback={null}>
      <EducationsDataTableWrapper {...props}>{children}</EducationsDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
