import { ResumeModelCondensedTileSkeleton } from '~/features/resume/components/tiles/ResumeModelCondensedTileSkeleton';

const Loading = () => (
  <>
    {Array.from({ length: 4 }).map((_, i) => (
      <ResumeModelCondensedTileSkeleton areTagsVisible={false} key={i} numDescriptionLines={3} />
    ))}
  </>
);

export default Loading;
