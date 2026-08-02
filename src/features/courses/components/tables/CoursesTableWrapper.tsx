import { type ReactNode, Suspense } from 'react';

import { DataTableProvider } from '~/components/tables/DataTableProvider';
import { type CoursesTableColumnId, CoursesTableColumns } from '~/features/courses';

import { CoursesDataTableWrapper } from './CoursesDataTableWrapper';

export interface CoursesTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: CoursesTableColumnId[];
}

export const CoursesTableWrapper = ({ children, ...props }: CoursesTableWrapperProps) => (
  <DataTableProvider
    areRowsDeletable
    areRowsSelectable
    columns={CoursesTableColumns}
    controlBarTargetId='courses-admin-table-control-bar'
    hasRowActions
  >
    <Suspense fallback={null}>
      <CoursesDataTableWrapper {...props}>{children}</CoursesDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
