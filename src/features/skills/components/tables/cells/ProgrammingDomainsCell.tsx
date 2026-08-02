import { type JSX } from 'react';

import { type EnumeratedLiteralsModel } from 'enumerated-literals';

import { type BrandSkill, type ProgrammingDomain, type ProgrammingDomains } from '~/database/model';

import { updateSkill } from '~/actions/skills/update-skill';

import { SelectCell } from '~/components/tables/cells/SelectCell';
import type * as types from '~/components/tables/types';
import { ProgrammingDomainSelect } from '~/features/skills/components/input/ProgrammingDomainSelect';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills/types';

interface ProgrammingDomainsCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ProgrammingDomainsCell = ({
  skill,
  table,
}: ProgrammingDomainsCellProps): JSX.Element => (
  <SelectCell<
    'multi',
    EnumeratedLiteralsModel<typeof ProgrammingDomains>,
    SkillsTableModel,
    ProgrammingDomain,
    BrandSkill
  >
    action={async v => await updateSkill(skill.id, { programmingDomains: v })}
    attribute='programmingDomains'
    behavior='multi'
    component={ProgrammingDomainSelect}
    errorMessage='There was an error updating the skill.'
    row={skill}
    table={table}
    value={skill.programmingDomains}
  />
);
