import { ProjectPageSkeleton } from '~/features/projects/components/ProjectPageSkeleton';

const Loading = () => (
  <ProjectPageSkeleton
    numDescriptionLines={2}
    numSkills={34}
    sections={[
      { numDescriptionLines: 11, numMedia: 0 },
      { numDescriptionLines: 7, numMedia: 2 },
    ]}
  />
);

export default Loading;
