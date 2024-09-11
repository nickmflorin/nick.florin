"use client";
import { type ApiSkill, type BrandSkill } from "~/prisma/model";

import { updateSkill } from "~/actions/mutations/skills";

import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";
import { SelectCell } from "~/components/tables/generic/cells/SelectCell";

interface CategoriesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
}

export const CategoriesCell = ({ skill }: CategoriesCellProps): JSX.Element => (
  <SelectCell<
    { isMulti: true },
    ApiSkill<["experiences", "educations", "projects", "repositories"]>,
    "categories",
    BrandSkill
  >
    component={SkillCategorySelect}
    attribute="categories"
    model={skill}
    options={{ isMulti: true }}
    action={async v => await updateSkill(skill.id, { categories: v })}
    errorMessage="There was an error updating the skill."
  />
);

export default CategoriesCell;
