import { type ReactNode, Suspense } from 'react';

import { DataTableProvider } from '~/components/tables/DataTableProvider';
import { type SkillsTableColumnId, SkillsTableColumns } from '~/features/skills';

import { SkillsDataTableWrapper } from './SkillsDataTableWrapper';

export interface SkillsTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: SkillsTableColumnId[];
}

export const SkillsTableWrapper = ({ children, ...props }: SkillsTableWrapperProps) => (
  <DataTableProvider
    areRowsDeletable
    areRowsSelectable
    columns={SkillsTableColumns}
    controlBarTargetId='skills-admin-table-control-bar'
    hasRowActions
  >
    <Suspense fallback={null}>
      <SkillsDataTableWrapper {...props}>{children}</SkillsDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
