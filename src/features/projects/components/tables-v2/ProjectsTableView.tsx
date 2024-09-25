"use client";
import type { ReactNode } from "react";

import { ProjectsDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedTableView } from "~/components/tables-v2/ConnectedTableView";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  ProjectsTableColumns,
  type ProjectsTableOrderableColumnId,
  type ProjectsTableColumnId,
  type ProjectsTableColumn,
  type ProjectsTableModel,
} from "~/features/projects";
import { useOrdering } from "~/hooks/use-ordering";

export interface ProjectsTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly excludeColumns?: ProjectsTableColumnId[];
}

export const ProjectsTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
}: ProjectsTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<ProjectsTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...ProjectsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: ProjectsDefaultOrdering,
  });
  return (
    <ConnectedTableView header={filterBar} footer={pagination}>
      <ConnectedDataTableWrapper<ProjectsTableModel, ProjectsTableColumn>
        excludeColumns={excludeColumns}
        ordering={ordering}
        onSort={(e, col) => setOrdering({ field: col.id })}
      >
        {children}
      </ConnectedDataTableWrapper>
    </ConnectedTableView>
  );
};
