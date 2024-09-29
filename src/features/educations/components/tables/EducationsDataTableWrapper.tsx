"use client";
import type { ReactNode } from "react";

import { EducationsDefaultOrdering } from "~/actions";

import { columnIsOrderable } from "~/components/tables";
import { ConnectedDataTableWrapper } from "~/components/tables/data-tables/ConnectedDataTableWrapper";
import {
  EducationsTableColumns,
  type EducationsTableOrderableColumnId,
  type EducationsTableColumnId,
  type EducationsTableColumn,
  type EducationsTableModel,
} from "~/features/educations";
import { useOrdering } from "~/hooks/use-ordering";

export interface EducationsDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: EducationsTableColumnId[];
}

export const EducationsDataTableWrapper = ({
  children,
  excludeColumns,
}: EducationsDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<EducationsTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...EducationsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: EducationsDefaultOrdering,
  });
  return (
    <ConnectedDataTableWrapper<EducationsTableModel, EducationsTableColumn>
      excludeColumns={excludeColumns}
      ordering={ordering}
      onSort={(e, col) => setOrdering({ field: col.id })}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
