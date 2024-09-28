import { type ApiRepository } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables";

export type RepositoriesTableModel = ApiRepository<["projects", "skills"]>;

export const RepositoriesTableColumns = [
  {
    id: "slug",
    label: "Slug",
    width: 260,
    isOrderable: true,
  },
  {
    id: "skills",
    label: "Skills",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "projects",
    label: "Projects",
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
    id: "npmPackageName",
    label: "NPM Package",
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
] as const satisfies DataTableColumnConfig<RepositoriesTableModel>[];

export type RepositoriesTableColumn = (typeof RepositoriesTableColumns)[number];

export type RepositoriesTableColumnId = TableColumnId<RepositoriesTableColumn>;

export type RepositoriesTableOrderableColumnId = OrderableTableColumnId<RepositoriesTableColumn>;
