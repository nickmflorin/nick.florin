import { Suspense } from 'react';

import { EducationTimeline } from '~/features/educations/components/EducationTimeline';
import { ResumeTimelineSkeleton } from '~/features/resume/components/ResumeTimelineSkeleton';

const EducationPage = () => (
  <Suspense
    fallback={
      <ResumeTimelineSkeleton
        numCourseworkLines={2}
        numDescriptionLines={2}
        numDetails={1}
        numItems={3}
        numSkills={8}
      />
    }
  >
    <EducationTimeline />
  </Suspense>
);

export default EducationPage;
