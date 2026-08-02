'use client';
import { type JSX } from 'react';

import { updateSkill } from '~/actions/skills/update-skill';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills/types';

interface PrioritizedCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const PrioritizedCell = ({ skill, table }: PrioritizedCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateSkill(id, { prioritized: value })}
    attribute='prioritized'
    errorMessage='There was an error updating the skill.'
    model={skill}
    table={table}
  />
);
