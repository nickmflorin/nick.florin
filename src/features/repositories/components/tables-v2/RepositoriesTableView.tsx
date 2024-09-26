"use client";
import type { ReactNode } from "react";

import { RepositoriesDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedTableView } from "~/components/tables-v2/ConnectedTableView";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  RepositoriesTableColumns,
  type RepositoriesTableOrderableColumnId,
  type RepositoriesTableColumnId,
  type RepositoriesTableColumn,
  type RepositoriesTableModel,
} from "~/features/repositories";
import { useOrdering } from "~/hooks/use-ordering";

export interface RepositoriesTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly excludeColumns?: RepositoriesTableColumnId[];
}

export const RepositoriesTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
}: RepositoriesTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<RepositoriesTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...RepositoriesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: RepositoriesDefaultOrdering,
  });
  return (
    <ConnectedTableView header={filterBar} footer={pagination}>
      <ConnectedDataTableWrapper<RepositoriesTableModel, RepositoriesTableColumn>
        excludeColumns={excludeColumns}
        ordering={ordering}
        onSort={(e, col) => setOrdering({ field: col.id })}
      >
        {children}
      </ConnectedDataTableWrapper>
    </ConnectedTableView>
  );
};
