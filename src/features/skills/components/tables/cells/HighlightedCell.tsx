"use client";
import { updateSkill } from "~/actions-v2/skills/update-skill";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import { type SkillsTableModel, type SkillsTableColumn } from "~/features/skills/types";

interface HighlightedCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const HighlightedCell = ({ skill, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    attribute="highlighted"
    model={skill}
    table={table}
    errorMessage="There was an error updating the skill."
    action={async (id, value) => await updateSkill(id, { highlighted: value })}
  />
);
