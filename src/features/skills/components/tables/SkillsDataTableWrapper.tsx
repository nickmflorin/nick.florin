"use client";
import type { ReactNode } from "react";

import { SkillsDefaultOrdering } from "~/actions-v2";

import { columnIsOrderable } from "~/components/tables";
import { ConnectedDataTableWrapper } from "~/components/tables/data-tables/ConnectedDataTableWrapper";
import {
  SkillsTableColumns,
  type SkillsTableOrderableColumnId,
  type SkillsTableColumnId,
  type SkillsTableColumn,
  type SkillsTableModel,
} from "~/features/skills";
import { useOrdering } from "~/hooks/use-ordering";

export interface SkillsDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: SkillsTableColumnId[];
}

export const SkillsDataTableWrapper = ({
  children,
  excludeColumns,
}: SkillsDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<SkillsTableOrderableColumnId>({
    useQueryParams: true,
    fields: [...SkillsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    defaultOrdering: SkillsDefaultOrdering,
  });
  return (
    <ConnectedDataTableWrapper<SkillsTableModel, SkillsTableColumn>
      excludeColumns={excludeColumns}
      ordering={ordering}
      onSort={(e, col) => setOrdering({ field: col.id })}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
