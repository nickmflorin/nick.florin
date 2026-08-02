'use client';
import { type ReactNode } from 'react';

import { EducationsDefaultOrdering } from '~/actions';

import { columnIsOrderable } from '~/components/tables';
import { ConnectedDataTableWrapper } from '~/components/tables/data-tables/ConnectedDataTableWrapper';
import {
  type EducationsTableColumn,
  type EducationsTableColumnId,
  EducationsTableColumns,
  type EducationsTableModel,
  type EducationsTableOrderableColumnId,
} from '~/features/educations';
import { useOrdering } from '~/hooks/use-ordering';

export interface EducationsDataTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: EducationsTableColumnId[];
}

export const EducationsDataTableWrapper = ({
  children,
  excludeColumns,
}: EducationsDataTableWrapperProps) => {
  const [ordering, setOrdering] = useOrdering<EducationsTableOrderableColumnId>({
    defaultOrdering: EducationsDefaultOrdering,
    fields: [...EducationsTableColumns].filter(c => columnIsOrderable(c)).map(c => c.id),
    useQueryParams: true,
  });
  return (
    <ConnectedDataTableWrapper<EducationsTableModel, EducationsTableColumn>
      excludeColumns={excludeColumns}
      onSort={(e, col) => setOrdering({ field: col.id })}
      ordering={ordering}
    >
      {children}
    </ConnectedDataTableWrapper>
  );
};
