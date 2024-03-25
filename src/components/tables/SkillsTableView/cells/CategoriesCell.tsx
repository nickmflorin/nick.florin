"use client";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/update-skill";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";
import { SelectCell } from "~/components/tables/cells/SelectCell";

interface CategoriesCellProps {
  readonly skill: ApiSkill;
}

export const CategoriesCell = ({ skill }: CategoriesCellProps): JSX.Element => (
  <SelectCell<ApiSkill, "categories">
    component={SkillCategorySelect}
    attribute="categories"
    model={skill}
    action={async v => {
      await updateSkill(skill.id, { categories: v });
    }}
    errorMessage="There was an error updating the skill."
  />
);

export default CategoriesCell;
