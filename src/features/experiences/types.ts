import { type ApiExperience } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables";

export type ExperiencesTableModel = ApiExperience<["details", "skills"]>;

export const ExperiencesTableColumns = [
  {
    id: "title",
    label: "Title",
    width: 260,
    isOrderable: true,
  },
  {
    id: "shortTitle",
    label: "Title (Abbv.)",
    width: 200,
    isOrderable: true,
  },
  {
    id: "company",
    label: "Company",
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
    id: "isCurrent",
    label: "Current",
    align: "center",
    width: 105,
    maxWidth: 105,
    minWidth: 105,
  },
  {
    id: "isRemote",
    label: "Remote",
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
] as const satisfies DataTableColumnConfig<ExperiencesTableModel>[];

export type ExperiencesTableColumn = (typeof ExperiencesTableColumns)[number];

export type ExperiencesTableColumnId = TableColumnId<ExperiencesTableColumn>;

export type ExperiencesTableOrderableColumnId = OrderableTableColumnId<ExperiencesTableColumn>;
