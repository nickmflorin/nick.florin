import { ResumeModelCondensedTileSkeleton } from '~/features/resume/components/tiles/ResumeModelCondensedTileSkeleton';

const Loading = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <ResumeModelCondensedTileSkeleton areTagsVisible={false} key={i} />
    ))}
  </>
);

export default Loading;
