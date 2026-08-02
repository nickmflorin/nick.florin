import { type ApiRepository } from '~/database/model';

import {
  type DataTableColumnConfig,
  type OrderableTableColumnId,
  type TableColumnId,
} from '~/components/tables';

export type RepositoriesTableModel = ApiRepository<['projects', 'skills']>;

export const RepositoriesTableColumns = [
  {
    id: 'slug',
    isOrderable: true,
    label: 'Slug',
    width: 260,
  },
  {
    id: 'skills',
    label: 'Skills',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'projects',
    label: 'Projects',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    align: 'right',
    id: 'startDate',
    isOrderable: true,
    label: 'Start Date',
    minWidth: 200,
    width: 200,
  },
  {
    id: 'npmPackageName',
    isOrderable: true,
    label: 'NPM Package',
    minWidth: 200,
    width: 200,
  },
  {
    align: 'right',
    id: 'createdAt',
    isOrderable: true,
    label: 'Created',
    minWidth: 200,
    width: 200,
  },
  {
    align: 'right',
    id: 'updatedAt',
    isOrderable: true,
    label: 'Updated',
    minWidth: 200,
    width: 200,
  },
  {
    align: 'center',
    id: 'highlighted',
    label: 'Highlight',
    maxWidth: 105,
    minWidth: 105,
    width: 105,
  },
  {
    align: 'center',
    id: 'visible',
    label: 'Visible',
    maxWidth: 80,
    minWidth: 80,
    width: 80,
  },
] as const satisfies DataTableColumnConfig<RepositoriesTableModel>[];

export type RepositoriesTableColumn = (typeof RepositoriesTableColumns)[number];

export type RepositoriesTableColumnId = TableColumnId<RepositoriesTableColumn>;

export type RepositoriesTableOrderableColumnId = OrderableTableColumnId<RepositoriesTableColumn>;
