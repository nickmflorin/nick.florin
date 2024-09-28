import type { ReactNode } from "react";
import { Suspense } from "react";

import { DataTableProvider } from "~/components/tables/DataTableProvider";
import { EducationsTableColumns, type EducationsTableColumnId } from "~/features/educations";

import { EducationsDataTableWrapper } from "./EducationsDataTableWrapper";

export interface EducationsTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: EducationsTableColumnId[];
}

export const EducationsTableWrapper = ({ children, ...props }: EducationsTableWrapperProps) => (
  <DataTableProvider
    columns={EducationsTableColumns}
    controlBarTargetId="educations-admin-table-control-bar"
    rowsAreDeletable
    rowsAreSelectable
    rowsHaveActions
  >
    <Suspense fallback={<></>}>
      <EducationsDataTableWrapper {...props}>{children}</EducationsDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
