"use client";
import type { ReactNode } from "react";

import { CoursesDefaultOrdering } from "~/actions";

import { columnIsOrderable } from "~/components/tables";
import { ConnectedDataTableWrapper } from "~/components/tables/data-tables/ConnectedDataTableWrapper";
import {
  CoursesTableColumns,
  type CoursesTableOrderableColumnId,
  type CoursesTableColumnId,
  type CoursesTableColumn,
  type CoursesTableModel,
} from "~/features/courses";
import { useOrdering } from "~/hooks/use-ordering";

export interface CoursesDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: CoursesTableColumnId[];
}

export const CoursesDataTableWrapper = ({
  children,
  excludeColumns,
}: CoursesDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<CoursesTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...CoursesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: CoursesDefaultOrdering,
  });
  return (
    <ConnectedDataTableWrapper<CoursesTableModel, CoursesTableColumn>
      excludeColumns={excludeColumns}
      ordering={ordering}
      onSort={(e, col) => setOrdering({ field: col.id })}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
