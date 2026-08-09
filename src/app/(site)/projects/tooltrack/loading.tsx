import { ProjectPageSkeleton } from '~/features/projects/components/ProjectPageSkeleton';

const Loading = () => (
  <ProjectPageSkeleton
    numDescriptionLines={6}
    numSkills={35}
    sections={[
      { numDescriptionLines: 10, numMedia: 0 },
      { numDescriptionLines: 6, numMedia: 0 },
      { numDescriptionLines: 3, numMedia: 0 },
    ]}
  />
);

export default Loading;
