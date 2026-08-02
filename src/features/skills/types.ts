import { type ApiSkill } from '~/database/model';

import {
  type DataTableColumnConfig,
  type OrderableTableColumnId,
  type TableColumnId,
} from '~/components/tables';

export type SkillsTableModel = ApiSkill<['experiences', 'educations', 'projects', 'repositories']>;

export const SkillsTableColumns = [
  {
    id: 'label',
    isOrderable: true,
    label: 'Label',
    width: 200,
  },
  {
    id: 'slug',
    isOrderable: true,
    label: 'Slug',
    width: 200,
  },
  {
    id: 'experience',
    label: 'Exp',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'experiences',
    label: 'Experiences',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'educations',
    label: 'Educations',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'projects',
    label: 'Projects',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'repositories',
    isHiddenByDefault: true,
    label: 'Repositories',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    align: 'center',
    id: 'calculatedExperience',
    isHiddenByDefault: true,
    isOrderable: true,
    label: 'Experience',
  },
  {
    id: 'categories',
    isHiddenByDefault: true,
    label: 'Categories',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'programmingLanguages',
    isHiddenByDefault: true,
    label: 'Prog. Languages',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    id: 'programmingDomains',
    isHiddenByDefault: true,
    label: 'Prog. Domains',
    maxWidth: 320,
    minWidth: 200,
    width: 260,
  },
  {
    align: 'right',
    id: 'createdAt',
    isOrderable: true,
    label: 'Created',
    minWidth: 200,
    width: 200,
  },
  {
    align: 'right',
    id: 'updatedAt',
    isOrderable: true,
    label: 'Updated',
    minWidth: 200,
    width: 200,
  },
  {
    align: 'center',
    id: 'highlighted',
    label: 'Highlight',
    maxWidth: 105,
    minWidth: 105,
    width: 105,
  },
  {
    align: 'center',
    id: 'prioritized',
    label: 'Priority',
    maxWidth: 105,
    minWidth: 105,
    width: 105,
  },
  {
    align: 'center',
    id: 'visible',
    label: 'Visible',
    maxWidth: 80,
    minWidth: 80,
    width: 80,
  },
] as const satisfies DataTableColumnConfig<SkillsTableModel>[];

export type SkillsTableColumn = (typeof SkillsTableColumns)[number];

export type SkillsTableColumnId = TableColumnId<SkillsTableColumn>;

export type SkillsTableOrderableColumnId = OrderableTableColumnId<SkillsTableColumn>;
