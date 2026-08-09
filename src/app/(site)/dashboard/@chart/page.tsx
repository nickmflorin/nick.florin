import { getEducationSelectOptions } from '~/actions/educations/get-education-select-options';
import { getExperienceSelectOptions } from '~/actions/experiences/get-experience-select-options';
import { fetchSkills } from '~/actions/skills/fetch-skills';
import { convertToPlainObject } from '~/api/serialization';

import { SkillsChartModule } from '~/features/skills/components/SkillsChartModule';

/* The fetch mirrors the default-filter query `SkillsChartModule` issues through SWR on the client,
   so the chart paints with the page instead of after hydration. The result seeds SWR as
   `fallbackData`; client-side SWR remains responsible for refetching when the filters change.

   The filter form's select options are deliberately NOT awaited: the promises are started before
   the skills read so all three queries run concurrently, then cross into the client tree
   unresolved, where the form's selects `use()` them behind `Suspense`. The data streams over the
   page's own RSC response — started at request time, ahead of any interaction — instead of being
   fetched through `/api/*` after hydration. */
const ChartPage = async () => {
  const educationsPromise = getEducationSelectOptions();
  const experiencesPromise = getExperienceSelectOptions();
  const fetcher = fetchSkills([]);
  const { data: skills } = await fetcher(
    {
      filters: { highlighted: true },
      ordering: { order: 'desc', orderBy: 'calculatedExperience' },
      visibility: 'public',
    },
    { strict: true },
  );
  return (
    <SkillsChartModule
      educationsPromise={educationsPromise}
      experiencesPromise={experiencesPromise}
      initialSkills={skills.map(convertToPlainObject)}
    />
  );
};

export default ChartPage;
