import { type ApiProject } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables";

export type ProjectsTableModel = ApiProject<["skills", "repositories"]>;

export const ProjectsTableColumns = [
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
    id: "repositories",
    label: "Repositories",
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
    id: "startDate",
    label: "Start Date",
    align: "right",
    width: 200,
    minWidth: 200,
    isOrderable: true,
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
] as const satisfies DataTableColumnConfig<ProjectsTableModel>[];

export type ProjectsTableColumn = (typeof ProjectsTableColumns)[number];

export type ProjectsTableColumnId = TableColumnId<ProjectsTableColumn>;

export type ProjectsTableOrderableColumnId = OrderableTableColumnId<ProjectsTableColumn>;
