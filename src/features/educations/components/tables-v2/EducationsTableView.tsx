"use client";
import type { ReactNode } from "react";

import { EducationsDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables-v2";
import { ConnectedTableView } from "~/components/tables-v2/ConnectedTableView";
import { ConnectedDataTableWrapper } from "~/components/tables-v2/data-tables/ConnectedDataTableWrapper";
import {
  EducationsTableColumns,
  type EducationsTableOrderableColumnId,
  type EducationsTableColumnId,
  type EducationsTableColumn,
  type EducationsTableModel,
} from "~/features/educations";
import { useOrdering } from "~/hooks/use-ordering";

export interface EducationsTableViewProps {
  readonly children: ReactNode;
  readonly filterBar?: JSX.Element;
  readonly pagination?: JSX.Element;
  readonly excludeColumns?: EducationsTableColumnId[];
}

export const EducationsTableView = ({
  children,
  filterBar,
  pagination,
  excludeColumns,
}: EducationsTableViewProps) => {
  const [ordering, setOrdering] = useOrdering<EducationsTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...EducationsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: EducationsDefaultOrdering,
  });
  return (
    <ConnectedTableView header={filterBar} footer={pagination}>
      <ConnectedDataTableWrapper<EducationsTableModel, EducationsTableColumn>
        excludeColumns={excludeColumns}
        ordering={ordering}
        onSort={(e, col) => setOrdering({ field: col.id })}
      >
        {children}
      </ConnectedDataTableWrapper>
    </ConnectedTableView>
  );
};
