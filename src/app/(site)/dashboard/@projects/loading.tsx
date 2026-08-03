import { ProjectTileSkeleton } from '~/features/projects/components/ProjectTileSkeleton';

const Loading = () => (
  <>
    {Array.from({ length: 4 }).map((_, i) => (
      <ProjectTileSkeleton key={i} />
    ))}
  </>
);

export default Loading;
