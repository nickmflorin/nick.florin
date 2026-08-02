'use client';
import { type ReactNode } from 'react';

import { CoursesDefaultOrdering } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableWrapper } from '~/components/tables/data-tables/ConnectedDataTableWrapper';
import {
  type CoursesTableColumn,
  type CoursesTableColumnId,
  CoursesTableColumns,
  type CoursesTableModel,
  type CoursesTableOrderableColumnId,
} from '~/features/courses';
import { useOrdering } from '~/hooks/use-ordering';

export interface CoursesDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: CoursesTableColumnId[];
}

export const CoursesDataTableWrapper = ({
  children,
  excludeColumns,
}: CoursesDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<CoursesTableOrderableColumnId>({
    defaultOrdering: CoursesDefaultOrdering,
    fields: [...CoursesTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    useQueryParams: true,
  });
  return (
    <ConnectedDataTableWrapper<CoursesTableModel, CoursesTableColumn>
      excludeColumns={excludeColumns}
      onSort={(e, col) => setOrdering({ field: col.id })}
      ordering={ordering}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
