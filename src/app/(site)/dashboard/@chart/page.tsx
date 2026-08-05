import { fetchSkills } from '~/actions/skills/fetch-skills';
import { convertToPlainObject } from '~/api/serialization';

import { SkillsChartModule } from '~/features/skills/components/SkillsChartModule';

/* The fetch mirrors the default-filter query `SkillsChartModule` issues through SWR on the client,
   so the chart paints with the page instead of after hydration. The result seeds SWR as
   `fallbackData`; client-side SWR remains responsible for refetching when the filters change. */
const ChartPage = async () => {
  const fetcher = fetchSkills([]);
  const { data: skills } = await fetcher(
    {
      filters: { highlighted: true },
      ordering: { order: 'desc', orderBy: 'calculatedExperience' },
      visibility: 'public',
    },
    { strict: true },
  );
  return <SkillsChartModule initialSkills={skills.map(convertToPlainObject)} />;
};

export default ChartPage;
