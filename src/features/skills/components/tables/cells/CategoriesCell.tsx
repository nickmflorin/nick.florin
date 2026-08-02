import { type JSX } from 'react';

import { type EnumeratedLiteralsModel } from 'enumerated-literals';

import { type BrandSkill, type SkillCategories, type SkillCategory } from '~/database/model';

import { updateSkill } from '~/actions/skills/update-skill';

import { SelectCell } from '~/components/tables/cells/SelectCell';
import type * as types from '~/components/tables/types';
import { SkillCategorySelect } from '~/features/skills/components/input/SkillCategorySelect';
import { type SkillsTableColumn, type SkillsTableModel } from '~/features/skills/types';

interface CategoriesCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const CategoriesCell = ({ skill, table }: CategoriesCellProps): JSX.Element => (
  <SelectCell<
    'multi',
    EnumeratedLiteralsModel<typeof SkillCategories>,
    SkillsTableModel,
    SkillCategory,
    BrandSkill
  >
    action={async v => await updateSkill(skill.id, { categories: v })}
    attribute='categories'
    behavior='multi'
    component={SkillCategorySelect}
    errorMessage='There was an error updating the skill.'
    row={skill}
    table={table}
    value={skill.categories}
  />
);
