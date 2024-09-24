"use client";
import type { ReactNode } from "react";

import { ExperiencesDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedTableView } from "~/components/tables-v2/ConnectedTableView";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  ExperiencesTableColumns,
  type ExperiencesTableOrderableColumnId,
  type ExperiencesTableColumnId,
  type ExperiencesTableColumn,
  type ExperiencesTableModel,
} from "~/features/experiences";
import { useOrdering } from "~/hooks/use-ordering";

export interface ExperiencesTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly excludeColumns?: ExperiencesTableColumnId[];
}

export const ExperiencesTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
}: ExperiencesTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<ExperiencesTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...ExperiencesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: ExperiencesDefaultOrdering,
  });
  return (
    <ConnectedTableView header={filterBar} footer={pagination}>
      <ConnectedDataTableWrapper<ExperiencesTableModel, ExperiencesTableColumn>
        excludeColumns={excludeColumns}
        ordering={ordering}
        onSort={(e, col) => setOrdering({ field: col.id })}
      >
        {children}
      </ConnectedDataTableWrapper>
    </ConnectedTableView>
  );
};
