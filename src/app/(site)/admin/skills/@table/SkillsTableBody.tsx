import { type SkillsControls, type SkillsFilters } from '~/actions';
import { fetchSkills } from '~/actions/skills/fetch-skills';

import { SkillsTableBody as ClientSkillsTableBody } from '~/features/skills/components/tables/SkillsTableBody';

const getSkills = async ({
  filters,
  ordering,
  page,
}: {
  readonly filters: SkillsFilters;
  readonly ordering: SkillsControls['ordering'];
  readonly page: number;
}) => {
  const fetcher = fetchSkills(['projects', 'educations', 'experiences', 'repositories']);
  const { data: skills } = await fetcher(
    {
      filters,
      ordering,
      page,
      visibility: 'admin',
    },
    { strict: true },
  );
  return skills;
};

export interface SkillsTableBodyProps {
  readonly filters: SkillsFilters;
  readonly ordering: SkillsControls['ordering'];
  readonly page: number;
}

export const SkillsTableBody = async ({ filters, ordering, page }: SkillsTableBodyProps) => {
  const skills = await getSkills({ filters, ordering, page });
  return <ClientSkillsTableBody data={skills} />;
};
