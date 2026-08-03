import { Suspense } from 'react';

import { Loading } from '~/components/loading/Loading';
import { ExperienceTimeline } from '~/features/experiences/components/ExperienceTimeline';

const ExperiencePage = () => (
  <Suspense fallback={<Loading isLoading />}>
    <ExperienceTimeline />
  </Suspense>
);

export default ExperiencePage;
