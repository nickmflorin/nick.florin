import { type ApiSkill } from "~/database/model";

import type { TableColumnId, OrderableTableColumnId } from "~/components/tables-v2";
import { ColumnsConfiguration } from "~/components/tables-v2";

export type SkillsTableModel = ApiSkill<["experiences", "educations", "projects", "repositories"]>;

const SkillsTableColumnConfigurations = ColumnsConfiguration([
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
    textAlign: "center",
    defaultVisible: false,
    isOrderable: true,
  },
  {
    id: "categories",
    label: "Categories",
    width: 220,
    defaultVisible: false,
  },
  {
    id: "programmingLanguages",
    label: "Prog. Languages",
    width: 220,
    defaultVisible: false,
  },
  {
    id: "createdAt",
    label: "Created",
    textAlign: "center",
    width: 170,
    isOrderable: true,
  },
  {
    id: "updatedAt",
    label: "Updated",
    textAlign: "center",
    width: 170,
    isOrderable: true,
  },
  {
    id: "includeInTopSkills",
    label: "Top Skill",
    textAlign: "center",
    width: 100,
  },
  {
    id: "visible",
    label: "Visible",
    width: 80,
    textAlign: "center",
  },
] as const);

export const SkillsTableColumns = SkillsTableColumnConfigurations.select([
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
]);

export type SkillsTableColumnId = TableColumnId<typeof SkillsTableColumns>;

export type SkillsTableOrderableColumnId = OrderableTableColumnId<typeof SkillsTableColumns>;
