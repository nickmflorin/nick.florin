import { ResumeTimelineSkeleton } from '~/features/resume/components/ResumeTimelineSkeleton';

const Loading = () => (
  <ResumeTimelineSkeleton
    numCourseworkLines={2}
    numDescriptionLines={2}
    numDetails={1}
    numItems={3}
    numSkills={8}
  />
);

export default Loading;
