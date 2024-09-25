import { type ApiSkill } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables-v2";

export type SkillsTableModel = ApiSkill<["experiences", "educations", "projects", "repositories"]>;

// TODO: Add courses and experience columns.
export const SkillsTableColumns = [
  {
    id: "label",
    label: "Label",
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
    id: "experiences",
    label: "Experiences",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "educations",
    label: "Educations",
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
    id: "repositories",
    label: "Repositories",
    minWidth: 200,
    width: 260,
    maxWidth: 320,
    isHiddenByDefault: true,
  },
  {
    id: "calculatedExperience",
    label: "Experience",
    align: "center",
    isHiddenByDefault: true,
    isOrderable: true,
  },
  {
    id: "categories",
    label: "Categories",
    isHiddenByDefault: true,
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "programmingLanguages",
    label: "Prog. Languages",
    isHiddenByDefault: true,
    minWidth: 200,
    width: 260,
    maxWidth: 320,
  },
  {
    id: "programmingDomains",
    label: "Prog. Domains",
    isHiddenByDefault: true,
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
    id: "highlighted",
    label: "Highlight",
    align: "center",
    width: 105,
    maxWidth: 105,
    minWidth: 105,
  },
  {
    id: "prioritized",
    label: "Priority",
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
] as const satisfies DataTableColumnConfig<SkillsTableModel>[];

export type SkillsTableColumn = (typeof SkillsTableColumns)[number];

export type SkillsTableColumnId = TableColumnId<SkillsTableColumn>;

export type SkillsTableOrderableColumnId = OrderableTableColumnId<SkillsTableColumn>;
