"use client";
import { updateSkill } from "~/actions/skills/update-skill";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills/types";

interface PrioritizedCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const PrioritizedCell = ({ skill, table }: PrioritizedCellProps): JSX.Element => (
  <CheckboxCell
    attribute="prioritized"
    model={skill}
    table={table}
    errorMessage="There was an error updating the skill."
    action={async (id, value) => await updateSkill(id, { prioritized: value })}
  />
);
