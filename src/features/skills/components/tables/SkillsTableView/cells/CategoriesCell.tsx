"use client";
import type { EnumeratedLiteralsModel } from "enumerated-literals";

import {
  type ApiSkill,
  type BrandSkill,
  type SkillCategory,
  type SkillCategories,
} from "~/database/model";

import { updateSkill } from "~/actions/mutations/skills";

import { SelectCell } from "~/components/tables/cells/SelectCell";
import { SkillCategorySelect } from "~/features/skills/components/input/SkillCategorySelect";

interface CategoriesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
}

export const CategoriesCell = ({ skill }: CategoriesCellProps): JSX.Element => (
  <SelectCell<"multi", EnumeratedLiteralsModel<typeof SkillCategories>, SkillCategory, BrandSkill>
    component={SkillCategorySelect}
    value={skill.categories}
    model={skill}
    behavior="multi"
    attribute="categories"
    action={async v => await updateSkill(skill.id, { categories: v })}
    errorMessage="There was an error updating the skill."
  />
);

export default CategoriesCell;
