import type { EnumeratedLiteralsModel } from "enumerated-literals";

import {
  type BrandSkill,
  type ProgrammingLanguages,
  type ProgrammingLanguage,
} from "~/database/model";

import { updateSkill } from "~/actions-v2/skills/update-skill";

import { SelectCell } from "~/components/tables-v2/cells/SelectCell";
import type * as types from "~/components/tables-v2/types";
import { ProgrammingLanguageSelect } from "~/features/skills/components/input/ProgrammingLanguageSelect";
import type { SkillsTableModel, SkillsTableColumn } from "~/features/skills/types";

interface ProgrammingLanguagesCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ProgrammingLanguagesCell = ({
  skill,
  table,
}: ProgrammingLanguagesCellProps): JSX.Element => (
  <SelectCell<
    "multi",
    EnumeratedLiteralsModel<typeof ProgrammingLanguages>,
    SkillsTableModel,
    ProgrammingLanguage,
    BrandSkill
  >
    component={ProgrammingLanguageSelect}
    table={table}
    behavior="multi"
    attribute="programmingLanguages"
    value={skill.programmingLanguages}
    row={skill}
    action={async v => await updateSkill(skill.id, { programmingLanguages: v })}
    errorMessage="There was an error updating the skill."
  />
);
