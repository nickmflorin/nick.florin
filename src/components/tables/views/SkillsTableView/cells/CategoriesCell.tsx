"use client";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/update-skill";
import { SkillCategorySelect } from "~/components/input/select/SkillCategorySelect";
import { SelectCell } from "~/components/tables/generic/cells/SelectCell";

interface CategoriesCellProps {
  readonly skill: ApiSkill<{ experiences: true; educations: true; projects: true }>;
}

export const CategoriesCell = ({ skill }: CategoriesCellProps): JSX.Element => (
  <SelectCell<ApiSkill<{ experiences: true; educations: true; projects: true }>, "categories">
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
