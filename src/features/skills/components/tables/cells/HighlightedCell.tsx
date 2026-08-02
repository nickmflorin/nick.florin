'use client';
import { type JSX } from 'react';

import { updateSkill } from '~/actions/skills/update-skill';

import { CheckboxCell } from '~/components/tables/cells/CheckboxCell';
import type * as types from '~/components/tables/types';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills/types';

interface HighlightedCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const HighlightedCell = ({ skill, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    action={async (id, value) => await updateSkill(id, { highlighted: value })}
    attribute='highlighted'
    errorMessage='There was an error updating the skill.'
    model={skill}
    table={table}
  />
);
