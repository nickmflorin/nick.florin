import { type ApiProject } from '~/database/model';

import {
  type DataTableColumnConfig,
  type OrderableTableColumnId,
  type TableColumnId,
} from '~/components/tables';

export type ProjectsTableModel = ApiProject<['skills', 'repositories']>;

export const ProjectsTableColumns = [
  {
    id: 'name',
    isOrderable: true,
    label: 'Name',
    width: 260,
  },
  {
    id: 'shortName',
    isOrderable: true,
    label: 'Name (Abbv.)',
    width: 200,
  },
  {
    id: 'repositories',
    label: 'Repositories',
    maxWidth: 320,
    minWidth: 200,
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
    align: 'right',
    id: 'startDate',
    isOrderable: true,
    label: 'Start Date',
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
] as const satisfies DataTableColumnConfig<ProjectsTableModel>[];

export type ProjectsTableColumn = (typeof ProjectsTableColumns)[number];

export type ProjectsTableColumnId = TableColumnId<ProjectsTableColumn>;

export type ProjectsTableOrderableColumnId = OrderableTableColumnId<ProjectsTableColumn>;
