"use client";
import type { ReactNode } from "react";

import { RepositoriesDefaultOrdering } from "~/actions";

import { columnIsOrderable } from "~/components/tables";
import { ConnectedDataTableWrapper } from "~/components/tables/data-tables/ConnectedDataTableWrapper";
import {
  RepositoriesTableColumns,
  type RepositoriesTableOrderableColumnId,
  type RepositoriesTableColumnId,
  type RepositoriesTableColumn,
  type RepositoriesTableModel,
} from "~/features/repositories";
import { useOrdering } from "~/hooks/use-ordering";

export interface RepositoriesDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: RepositoriesTableColumnId[];
}

export const RepositoriesDataTableWrapper = ({
  children,
  excludeColumns,
}: RepositoriesDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<RepositoriesTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...RepositoriesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: RepositoriesDefaultOrdering,
  });
  return (
    <ConnectedDataTableWrapper<RepositoriesTableModel, RepositoriesTableColumn>
      excludeColumns={excludeColumns}
      ordering={ordering}
      onSort={(e, col) => setOrdering({ field: col.id })}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
