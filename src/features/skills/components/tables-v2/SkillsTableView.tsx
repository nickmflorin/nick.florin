"use client";
import type { ReactNode } from "react";

import { SkillsDefaultOrdering } from "~/actions-v2";

import { DataTableWrapper } from "~/components/tables-v2/data-tables/DataTableWrapper";
import { TableView } from "~/components/tables-v2/TableView";
import {
  SkillsTableColumns,
  type SkillsTableOrderableColumnId,
  type SkillsTableColumnId,
} from "~/features/skills";
import { useOrdering } from "~/hooks/use-ordering";

export interface SkillsTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly controlBarTargetId: string;
  readonly excludeColumns?: SkillsTableColumnId[];
}

export const SkillsTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
  controlBarTargetId,
}: SkillsTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<SkillsTableOrderableColumnId>({
    useQueryParams: true,
    fields: SkillsTableColumns.orderableColumns.map(c => c.id),
    defaultOrdering: SkillsDefaultOrdering,
  });
  return (
    <TableView header={filterBar} footer={pagination} controlBarTargetId={controlBarTargetId}>
      <DataTableWrapper
        columns={SkillsTableColumns.columns}
        excludeColumns={excludeColumns}
        rowsAreSelectable
        rowsHaveActions
        ordering={ordering}
        onSort={(e, col) => {
          const id = col.id;
          if (SkillsTableColumns.isOrderableColumnId(id)) {
            setOrdering({ field: id });
          }
        }}
      >
        {children}
      </DataTableWrapper>
    </TableView>
  );
};
