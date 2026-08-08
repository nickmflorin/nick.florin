import { ProjectPageSkeleton } from '~/features/projects/components/ProjectPageSkeleton';

const Loading = () => (
  <ProjectPageSkeleton
    numDescriptionLines={7}
    numSkills={35}
    sections={[
      { numDescriptionLines: 10, numMedia: 0 },
      { numDescriptionLines: 8, numMedia: 0 },
      { numDescriptionLines: 9, numMedia: 0 },
    ]}
  />
);

export default Loading;
