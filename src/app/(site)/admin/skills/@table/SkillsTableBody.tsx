import dynamic from 'next/dynamic';

import { type SkillsControls, type SkillsFilters } from '~/actions';
import { fetchSkills } from '~/actions/skills/fetch-skills';

import { Loading } from '~/components/loading/Loading';
import { SkillsTableControlBarPlaceholder } from '~/features/skills/components/tables/SkillsTableControlBarPlaceholder';

const ClientSkillsTableBody = dynamic(
  () =>
    import('~/features/skills/components/tables/SkillsTableBody').then(mod => mod.SkillsTableBody),
  {
    loading: () => (
      <>
        <SkillsTableControlBarPlaceholder />
        <Loading component='tbody' isLoading />
      </>
    ),
  },
);

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
