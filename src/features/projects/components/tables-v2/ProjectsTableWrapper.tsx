import type { ReactNode } from "react";
import { Suspense } from "react";

import { DataTableProvider } from "~/components/tables-v2/DataTableProvider";
import { ProjectsTableColumns, type ProjectsTableColumnId } from "~/features/projects";

import { ProjectsDataTableWrapper } from "./ProjectsDataTableWrapper";

export interface ProjectsTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ProjectsTableColumnId[];
}

export const ProjectsTableWrapper = ({ children, ...props }: ProjectsTableWrapperProps) => (
  <DataTableProvider
    columns={ProjectsTableColumns}
    controlBarTargetId="projects-admin-table-control-bar"
    rowsAreDeletable
    rowsAreSelectable
    rowsHaveActions
  >
    <Suspense fallback={<></>}>
      <ProjectsDataTableWrapper {...props}>{children}</ProjectsDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
