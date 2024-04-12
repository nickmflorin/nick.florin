"use client";
import { type ApiSkill, type BrandSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";
import { SelectCell } from "~/components/tables/generic/cells/SelectCell";

interface CategoriesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects"]>;
}

export const CategoriesCell = ({ skill }: CategoriesCellProps): JSX.Element => (
  <SelectCell<ApiSkill<["experiences", "educations", "projects"]>, "categories", BrandSkill>
    component={SkillCategorySelect}
    attribute="categories"
    model={skill}
    action={async v => await updateSkill(skill.id, { categories: v })}
    errorMessage="There was an error updating the skill."
  />
);

export default CategoriesCell;
