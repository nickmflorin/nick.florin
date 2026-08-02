'use client';
import { type JSX } from 'react';

import { updateSkill } from '~/actions/skills/update-skill';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills/types';

interface VisibleCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const VisibleCell = ({ skill, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateSkill(id, { visible: value })}
    attribute='visible'
    errorMessage='There was an error updating the skill.'
    model={skill}
    table={table}
  />
);
