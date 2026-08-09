import { ProjectPageSkeleton } from '~/features/projects/components/ProjectPageSkeleton';

const Loading = () => (
  <ProjectPageSkeleton
    numDescriptionLines={3}
    numRepositories={0}
    numSkills={7}
    sections={[
      { hasTitle: false, numDescriptionLines: 1, numMedia: 0 },
      { numDescriptionLines: 14, numMedia: 1 },
      { numDescriptionLines: 12, numMedia: 1 },
      { hasTitle: false, numDescriptionLines: 0, numMedia: 2 },
    ]}
  />
);

export default Loading;
