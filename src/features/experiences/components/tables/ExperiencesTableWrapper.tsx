import type { ReactNode } from "react";
import { Suspense } from "react";

import { DataTableProvider } from "~/components/tables/DataTableProvider";
import { ExperiencesTableColumns, type ExperiencesTableColumnId } from "~/features/experiences";

import { ExperiencesDataTableWrapper } from "./ExperiencesDataTableWrapper";

export interface ExperiencesTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ExperiencesTableColumnId[];
}

export const ExperiencesTableWrapper = ({ children, ...props }: ExperiencesTableWrapperProps) => (
  <DataTableProvider
    columns={ExperiencesTableColumns}
    controlBarTargetId="experiences-admin-table-control-bar"
    rowsAreDeletable
    rowsAreSelectable
    rowsHaveActions
  >
    <Suspense fallback={<></>}>
      <ExperiencesDataTableWrapper {...props}>{children}</ExperiencesDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
