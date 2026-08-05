import { ResumeModelCondensedTileSkeleton } from '~/features/resume/components/tiles/ResumeModelCondensedTileSkeleton';

/* Of the education tiles this slot streams in, only the first carries a description — the skeleton
   mirrors that so the education module (whose grid row is content-fitted) reserves the same height
   the streamed content settles at. */
const Loading = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <ResumeModelCondensedTileSkeleton
        areTagsVisible={false}
        key={i}
        numDescriptionLines={i === 0 ? 2 : 0}
      />
    ))}
  </>
);

export default Loading;
