import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { type BrandSkill, type SkillCategories, type SkillCategory } from "~/database/model";

import { updateSkill } from "~/actions-v2/skills/update-skill";

import { SelectCell } from "~/components/tables/cells/SelectCell";
import type * as types from "~/components/tables/types";
import { SkillCategorySelect } from "~/features/skills/components/input/SkillCategorySelect";
import type { SkillsTableModel, SkillsTableColumn } from "~/features/skills/types";

interface CategoriesCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const CategoriesCell = ({ skill, table }: CategoriesCellProps): JSX.Element => (
  <SelectCell<
    "multi",
    EnumeratedLiteralsModel<typeof SkillCategories>,
    SkillsTableModel,
    SkillCategory,
    BrandSkill
  >
    component={SkillCategorySelect}
    table={table}
    behavior="multi"
    attribute="categories"
    value={skill.categories}
    row={skill}
    action={async v => await updateSkill(skill.id, { categories: v })}
    errorMessage="There was an error updating the skill."
  />
);
