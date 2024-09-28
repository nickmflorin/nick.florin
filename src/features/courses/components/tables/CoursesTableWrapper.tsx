import type { ReactNode } from "react";
import { Suspense } from "react";

import { DataTableProvider } from "~/components/tables/DataTableProvider";
import { CoursesTableColumns, type CoursesTableColumnId } from "~/features/courses";

import { CoursesDataTableWrapper } from "./CoursesDataTableWrapper";

export interface CoursesTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: CoursesTableColumnId[];
}

export const CoursesTableWrapper = ({ children, ...props }: CoursesTableWrapperProps) => (
  <DataTableProvider
    columns={CoursesTableColumns}
    controlBarTargetId="courses-admin-table-control-bar"
    rowsAreDeletable
    rowsAreSelectable
    rowsHaveActions
  >
    <Suspense fallback={<></>}>
      <CoursesDataTableWrapper {...props}>{children}</CoursesDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
