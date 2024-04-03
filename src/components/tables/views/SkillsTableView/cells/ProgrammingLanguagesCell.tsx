import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SelectCell } from "~/components/tables/generic/cells/SelectCell";

interface ProgrammingLanguagesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects"]>;
}

export const ProgrammingLanguagesCell = ({ skill }: ProgrammingLanguagesCellProps): JSX.Element => (
  <SelectCell<ApiSkill<["experiences", "educations", "projects"]>, "programmingLanguages">
    component={ProgrammingLanguageSelect}
    attribute="programmingLanguages"
    model={skill}
    action={async v => {
      await updateSkill(skill.id, { programmingLanguages: v });
    }}
    errorMessage="There was an error updating the skill."
  />
);

export default ProgrammingLanguagesCell;
