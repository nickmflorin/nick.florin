"use client";
import type { ReactNode } from "react";

import { ExperiencesDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  ExperiencesTableColumns,
  type ExperiencesTableOrderableColumnId,
  type ExperiencesTableColumnId,
  type ExperiencesTableColumn,
  type ExperiencesTableModel,
} from "~/features/experiences";
import { useOrdering } from "~/hooks/use-ordering";

export interface ExperiencesDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: ExperiencesTableColumnId[];
}

export const ExperiencesDataTableWrapper = ({
  children,
  excludeColumns,
}: ExperiencesDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<ExperiencesTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...ExperiencesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: ExperiencesDefaultOrdering,
  });
  return (
    <ConnectedDataTableWrapper<ExperiencesTableModel, ExperiencesTableColumn>
      excludeColumns={excludeColumns}
      ordering={ordering}
      onSort={(e, col) => setOrdering({ field: col.id })}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
