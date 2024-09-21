import { type ApiSkill } from "~/database/model";

import type {
  DataTableColumnConfig,
  OrderableTableColumnId,
  TableColumnId,
} from "~/components/tables-v2";

/* import type {
     ConfiguredTableColumnId,
     ConfiguredOrderableTableColumnId,
     ConfiguredTableColumn,
   } from "~/components/tables-v2";
   import { ColumnsConfiguration } from "~/components/tables-v2"; */

export type SkillsTableModel = ApiSkill<["experiences", "educations", "projects", "repositories"]>;

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
  },
  {
    id: "educations",
    label: "Educations",
  },
  {
    id: "projects",
    label: "Projects",
  },
  {
    id: "repositories",
    label: "Repositories",
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
    width: 220,
    isHiddenByDefault: true,
  },
  {
    id: "programmingLanguages",
    label: "Prog. Languages",
    width: 220,
    isHiddenByDefault: true,
  },
  {
    id: "createdAt",
    label: "Created",
    align: "center",
    width: 170,
    isOrderable: true,
  },
  {
    id: "updatedAt",
    label: "Updated",
    align: "center",
    width: 170,
    isOrderable: true,
  },
  {
    id: "includeInTopSkills",
    label: "Top Skill",
    align: "center",
    width: 100,
  },
  {
    id: "visible",
    label: "Visible",
    width: 80,
    align: "center",
  },
] as const satisfies DataTableColumnConfig<SkillsTableModel>[];

/* export const SkillsTableColumns = SkillsTableColumnConfigurations.select([
     "label",
     "slug",
     "experiences",
     "educations",
     "projects",
     "repositories",
     "calculatedExperience",
     "categories",
     "programmingLanguages",
     "createdAt",
     "updatedAt",
     "includeInTopSkills",
     "visible",
   ]); */

// export type SkillsTableColumn = ConfiguredTableColumn<typeof SkillsTableColumns>;

export type SkillsTableColumn = (typeof SkillsTableColumns)[number];

// export type SkillsTableColumnId = ConfiguredTableColumnId<typeof SkillsTableColumns>;

export type SkillsTableColumnId = TableColumnId<SkillsTableColumn>;

/* export type SkillsTableOrderableColumnId = ConfiguredOrderableTableColumnId<
     typeof SkillsTableColumns
   >; */

export type SkillsTableOrderableColumnId = OrderableTableColumnId<SkillsTableColumn>;
