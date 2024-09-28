"use client";
import type { ReactNode } from "react";

import { ProjectsDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables";
import { ConnectedDataTableWrapper } from "~/components/tables/data-tables/ConnectedDataTableWrapper";
import {
  ProjectsTableColumns,
  type ProjectsTableOrderableColumnId,
  type ProjectsTableColumnId,
  type ProjectsTableColumn,
  type ProjectsTableModel,
} from "~/features/projects";
import { useOrdering } from "~/hooks/use-ordering";

export interface ProjectsDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ProjectsTableColumnId[];
}

export const ProjectsDataTableWrapper = ({
  children,
  excludeColumns,
}: ProjectsDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<ProjectsTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...ProjectsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: ProjectsDefaultOrdering,
  });
  return (
    <ConnectedDataTableWrapper<ProjectsTableModel, ProjectsTableColumn>
      excludeColumns={excludeColumns}
      ordering={ordering}
      onSort={(e, col) => setOrdering({ field: col.id })}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
