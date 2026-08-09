import { ProjectPageSkeleton } from '~/features/projects/components/ProjectPageSkeleton';

const Loading = () => (
  <ProjectPageSkeleton
    numDescriptionLines={2}
    numSkills={34}
    sections={[
      { numDescriptionLines: 10, numMedia: 0 },
      { numDescriptionLines: 6, numMedia: 3 },
    ]}
  />
);

export default Loading;
