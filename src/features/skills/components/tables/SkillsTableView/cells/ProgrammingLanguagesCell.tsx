import type { EnumeratedLiteralsModel } from "enumerated-literals";

import {
  type ApiSkill,
  type BrandSkill,
  type ProgrammingLanguages,
  type ProgrammingLanguage,
} from "~/prisma/model";

import { updateSkill } from "~/actions/mutations/skills";

import { SelectCell } from "~/components/tables/cells/SelectCell";
import { ProgrammingLanguageSelect } from "~/features/skills/components/input/ProgrammingLanguageSelect";

interface ProgrammingLanguagesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
}

export const ProgrammingLanguagesCell = ({ skill }: ProgrammingLanguagesCellProps): JSX.Element => (
  <SelectCell<
    "multi",
    EnumeratedLiteralsModel<typeof ProgrammingLanguages>,
    ProgrammingLanguage,
    BrandSkill
  >
    component={ProgrammingLanguageSelect}
    behavior="multi"
    attribute="programmingLanguages"
    value={skill.programmingLanguages}
    model={skill}
    action={async v => await updateSkill(skill.id, { programmingLanguages: v })}
    errorMessage="There was an error updating the skill."
  />
);

export default ProgrammingLanguagesCell;
