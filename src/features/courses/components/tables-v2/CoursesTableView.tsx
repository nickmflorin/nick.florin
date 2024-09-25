"use client";
import type { ReactNode } from "react";

import { CoursesDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedTableView } from "~/components/tables-v2/ConnectedTableView";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  CoursesTableColumns,
  type CoursesTableOrderableColumnId,
  type CoursesTableColumnId,
  type CoursesTableColumn,
  type CoursesTableModel,
} from "~/features/courses";
import { useOrdering } from "~/hooks/use-ordering";

export interface CoursesTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly excludeColumns?: CoursesTableColumnId[];
}

export const CoursesTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
}: CoursesTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<CoursesTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...CoursesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: CoursesDefaultOrdering,
  });
  return (
    <ConnectedTableView header={filterBar} footer={pagination}>
      <ConnectedDataTableWrapper<CoursesTableModel, CoursesTableColumn>
        excludeColumns={excludeColumns}
        ordering={ordering}
        onSort={(e, col) => setOrdering({ field: col.id })}
      >
        {children}
      </ConnectedDataTableWrapper>
    </ConnectedTableView>
  );
};
