import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/update-skill";
import { ProgrammingLanguageSelect } from "~/components/input/select/ProgrammingLanguageSelect";
import { SelectCell } from "~/components/tables/generic/cells/SelectCell";

interface ProgrammingLanguagesCellProps {
  readonly skill: ApiSkill<{ experiences: true; educations: true; projects: true }>;
}

export const ProgrammingLanguagesCell = ({ skill }: ProgrammingLanguagesCellProps): JSX.Element => (
  <SelectCell<
    ApiSkill<{ experiences: true; educations: true; projects: true }>,
    "programmingLanguages"
  >
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
