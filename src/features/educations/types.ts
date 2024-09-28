import { type ApiEducation } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables";

export type EducationsTableModel = ApiEducation<["details", "skills"]>;

export const EducationsTableColumns = [
  {
    id: "major",
    label: "Major",
    width: 260,
    isOrderable: true,
  },
  {
    id: "shortMajor",
    label: "Major (Abbv.)",
    width: 200,
    isOrderable: true,
  },
  {
    id: "school",
    label: "School",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "degree",
    label: "Degree",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "details",
    label: "Details",
    minWidth: 100,
    width: 120,
    maxWidth: 140,
  },
  {
    id: "skills",
    label: "Skills",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "startDate",
    label: "Start Date",
    align: "right",
    width: 200,
    minWidth: 200,
    isOrderable: true,
    isHiddenByDefault: true,
  },
  {
    id: "endDate",
    label: "End Date",
    align: "right",
    width: 200,
    minWidth: 200,
    isOrderable: true,
    isHiddenByDefault: true,
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
    id: "postPoned",
    label: "Post Poned",
    align: "center",
    width: 105,
    maxWidth: 105,
    minWidth: 105,
  },
  {
    id: "highlighted",
    label: "Highlight",
    align: "center",
    width: 105,
    maxWidth: 105,
    minWidth: 105,
  },
  {
    id: "visible",
    label: "Visible",
    width: 80,
    maxWidth: 80,
    minWidth: 80,
    align: "center",
  },
] as const satisfies DataTableColumnConfig<EducationsTableModel>[];

export type EducationsTableColumn = (typeof EducationsTableColumns)[number];

export type EducationsTableColumnId = TableColumnId<EducationsTableColumn>;

export type EducationsTableOrderableColumnId = OrderableTableColumnId<EducationsTableColumn>;
