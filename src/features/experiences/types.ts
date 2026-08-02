import { type ApiExperience } from '~/database/model';

import {
  type DataTableColumnConfig,
  type OrderableTableColumnId,
  type TableColumnId,
} from '~/components/tables';

export type ExperiencesTableModel = ApiExperience<['details', 'skills']>;

export const ExperiencesTableColumns = [
  {
    id: 'title',
    isOrderable: true,
    label: 'Title',
    width: 260,
  },
  {
    id: 'shortTitle',
    isOrderable: true,
    label: 'Title (Abbv.)',
    width: 200,
  },
  {
    id: 'company',
    label: 'Company',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'details',
    label: 'Details',
    maxWidth: 140,
    minWidth: 100,
    width: 120,
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
    isHiddenByDefault: true,
    isOrderable: true,
    label: 'Start Date',
    minWidth: 200,
    width: 200,
  },
  {
    align: 'right',
    id: 'endDate',
    isHiddenByDefault: true,
    isOrderable: true,
    label: 'End Date',
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
    id: 'isCurrent',
    label: 'Current',
    maxWidth: 105,
    minWidth: 105,
    width: 105,
  },
  {
    align: 'center',
    id: 'isRemote',
    label: 'Remote',
    maxWidth: 105,
    minWidth: 105,
    width: 105,
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
] as const satisfies DataTableColumnConfig<ExperiencesTableModel>[];

export type ExperiencesTableColumn = (typeof ExperiencesTableColumns)[number];

export type ExperiencesTableColumnId = TableColumnId<ExperiencesTableColumn>;

export type ExperiencesTableOrderableColumnId = OrderableTableColumnId<ExperiencesTableColumn>;
