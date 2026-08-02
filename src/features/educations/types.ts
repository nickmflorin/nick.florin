import { type ApiEducation } from '~/database/model';

import {
  type DataTableColumnConfig,
  type OrderableTableColumnId,
  type TableColumnId,
} from '~/components/tables';

export type EducationsTableModel = ApiEducation<['details', 'skills']>;

export const EducationsTableColumns = [
  {
    id: 'major',
    isOrderable: true,
    label: 'Major',
    width: 260,
  },
  {
    id: 'shortMajor',
    isOrderable: true,
    label: 'Major (Abbv.)',
    width: 200,
  },
  {
    id: 'school',
    label: 'School',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'degree',
    label: 'Degree',
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
    id: 'postPoned',
    label: 'Postponed',
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
] as const satisfies DataTableColumnConfig<EducationsTableModel>[];

export type EducationsTableColumn = (typeof EducationsTableColumns)[number];

export type EducationsTableColumnId = TableColumnId<EducationsTableColumn>;

export type EducationsTableOrderableColumnId = OrderableTableColumnId<EducationsTableColumn>;
