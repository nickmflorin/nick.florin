import { Suspense } from 'react';

import { Loading } from '~/components/loading/Loading';
import { EducationTimeline } from '~/features/educations/components/EducationTimeline';

const EducationPage = () => (
  <Suspense fallback={<Loading isLoading />}>
    <EducationTimeline />
  </Suspense>
);

export default EducationPage;
