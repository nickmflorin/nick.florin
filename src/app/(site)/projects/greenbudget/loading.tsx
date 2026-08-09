import { ProjectPageSkeleton } from '~/features/projects/components/ProjectPageSkeleton';

const Loading = () => (
  <ProjectPageSkeleton
    numDescriptionLines={10}
    numDisclaimerLines={9}
    numRepositories={2}
    numSkills={72}
    sections={[
      { numDescriptionLines: 7, numMedia: 1 },
      { numDescriptionLines: 6, numMedia: 2 },
    ]}
  />
);

export default Loading;
