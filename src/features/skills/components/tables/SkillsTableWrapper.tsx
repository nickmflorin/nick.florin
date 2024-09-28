import type { ReactNode } from "react";
import { Suspense } from "react";

import { DataTableProvider } from "~/components/tables/DataTableProvider";
import { SkillsTableColumns, type SkillsTableColumnId } from "~/features/skills";

import { SkillsDataTableWrapper } from "./SkillsDataTableWrapper";

export interface SkillsTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: SkillsTableColumnId[];
}

export const SkillsTableWrapper = ({ children, ...props }: SkillsTableWrapperProps) => (
  <DataTableProvider
    columns={SkillsTableColumns}
    controlBarTargetId="skills-admin-table-control-bar"
    rowsAreDeletable
    rowsAreSelectable
    rowsHaveActions
  >
    <Suspense fallback={<></>}>
      <SkillsDataTableWrapper {...props}>{children}</SkillsDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
