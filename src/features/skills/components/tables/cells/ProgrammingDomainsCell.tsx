import type { EnumeratedLiteralsModel } from "enumerated-literals";

import { type BrandSkill, type ProgrammingDomains, type ProgrammingDomain } from "~/database/model";

import { updateSkill } from "~/actions/skills/update-skill";

import { SelectCell } from "~/components/tables/cells/SelectCell";
import type * as types from "~/components/tables/types";
import { ProgrammingDomainSelect } from "~/features/skills/components/input/ProgrammingDomainSelect";
import type { SkillsTableModel, SkillsTableColumn } from "~/features/skills/types";

interface ProgrammingDomainsCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ProgrammingDomainsCell = ({
  skill,
  table,
}: ProgrammingDomainsCellProps): JSX.Element => (
  <SelectCell<
    "multi",
    EnumeratedLiteralsModel<typeof ProgrammingDomains>,
    SkillsTableModel,
    ProgrammingDomain,
    BrandSkill
  >
    component={ProgrammingDomainSelect}
    table={table}
    behavior="multi"
    attribute="programmingDomains"
    value={skill.programmingDomains}
    row={skill}
    action={async v => await updateSkill(skill.id, { programmingDomains: v })}
    errorMessage="There was an error updating the skill."
  />
);
