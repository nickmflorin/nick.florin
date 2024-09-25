import { type ApiCourse } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables-v2";

export type CoursesTableModel = ApiCourse<["education", "skills"]>;

export const CourseOrderableFields = [
  "name",
  "shortName",
  "slug",
  "createdAt",
  "updatedAt",
  "education",
] as const;

export const CoursesTableColumns = [
  {
    id: "name",
    label: "Name",
    width: 260,
    isOrderable: true,
  },
  {
    id: "shortName",
    label: "Name (Abbv.)",
    width: 200,
    isOrderable: true,
  },
  {
    id: "slug",
    label: "Slug",
    width: 200,
    isOrderable: true,
  },
  {
    id: "education",
    label: "Education",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "skills",
    label: "Skills",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "createdAt",
    label: "Created",
    align: "right",
    width: 200,
    minWidth: 200,
    isOrderable: true,
  },
  {
    id: "updatedAt",
    label: "Updated",
    align: "right",
    width: 200,
    minWidth: 200,
    isOrderable: true,
  },
  {
    id: "visible",
    label: "Visible",
    width: 80,
    maxWidth: 80,
    minWidth: 80,
    align: "center",
  },
] as const satisfies DataTableColumnConfig<CoursesTableModel>[];

export type CoursesTableColumn = (typeof CoursesTableColumns)[number];

export type CoursesTableColumnId = TableColumnId<CoursesTableColumn>;

export type CoursesTableOrderableColumnId = OrderableTableColumnId<CoursesTableColumn>;
