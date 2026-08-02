import { type ApiCourse } from '~/database/model';

import {
  type DataTableColumnConfig,
  type OrderableTableColumnId,
  type TableColumnId,
} from '~/components/tables';

export type CoursesTableModel = ApiCourse<['education', 'skills']>;

export const CourseOrderableFields = [
  'name',
  'shortName',
  'slug',
  'createdAt',
  'updatedAt',
  'education',
] as const;

export const CoursesTableColumns = [
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
    id: 'slug',
    isOrderable: true,
    label: 'Slug',
    width: 200,
  },
  {
    id: 'education',
    label: 'Education',
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
    id: 'visible',
    label: 'Visible',
    maxWidth: 80,
    minWidth: 80,
    width: 80,
  },
] as const satisfies DataTableColumnConfig<CoursesTableModel>[];

export type CoursesTableColumn = (typeof CoursesTableColumns)[number];

export type CoursesTableColumnId = TableColumnId<CoursesTableColumn>;

export type CoursesTableOrderableColumnId = OrderableTableColumnId<CoursesTableColumn>;
