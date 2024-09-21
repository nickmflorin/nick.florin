"use client";
import type { ReactNode } from "react";

import { SkillsDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedTableView } from "~/components/tables-v2/ConnectedTableView";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  SkillsTableColumns,
  type SkillsTableOrderableColumnId,
  type SkillsTableColumnId,
  type SkillsTableColumn,
  type SkillsTableModel,
} from "~/features/skills";
import { useOrdering } from "~/hooks/use-ordering";

export interface SkillsTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly excludeColumns?: SkillsTableColumnId[];
}

export const SkillsTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
}: SkillsTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<SkillsTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...SkillsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: SkillsDefaultOrdering,
  });
  return (
    <ConnectedTableView header={filterBar} footer={pagination}>
      <ConnectedDataTableWrapper<SkillsTableModel, SkillsTableColumn>
        excludeColumns={excludeColumns}
        ordering={ordering}
        onSort={(e, col) => setOrdering({ field: col.id })}
      >
        {children}
      </ConnectedDataTableWrapper>
    </ConnectedTableView>
  );
};
