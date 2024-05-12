import { type ApiSkill, type BrandSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SelectCell } from "~/components/tables/generic/cells/SelectCell";

interface ProgrammingLanguagesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
}

export const ProgrammingLanguagesCell = ({ skill }: ProgrammingLanguagesCellProps): JSX.Element => (
  <SelectCell<
    { isMulti: true },
    ApiSkill<["experiences", "educations", "projects"]>,
    "programmingLanguages",
    BrandSkill
  >
    component={ProgrammingLanguageSelect}
    options={{ isMulti: true }}
    attribute="programmingLanguages"
    model={skill}
    action={async v => await updateSkill(skill.id, { programmingLanguages: v })}
    errorMessage="There was an error updating the skill."
  />
);

export default ProgrammingLanguagesCell;
