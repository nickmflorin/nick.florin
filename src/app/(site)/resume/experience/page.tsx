import { Suspense } from 'react';

import { ExperienceTimeline } from '~/features/experiences/components/ExperienceTimeline';
import { ResumeTimelineSkeleton } from '~/features/resume/components/ResumeTimelineSkeleton';

const ExperiencePage = () => (
  <Suspense fallback={<ResumeTimelineSkeleton numDetails={4} numItems={4} numSkills={12} />}>
    <ExperienceTimeline />
  </Suspense>
);

export default ExperiencePage;
