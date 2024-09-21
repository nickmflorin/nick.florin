import { ResumeModelCondensedTileSkeleton } from "~/features/resume/components/tiles/ResumeModelCondensedTileSkeleton";

export default function Loading() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <ResumeModelCondensedTileSkeleton key={i} showTags={false} numDescriptionLines={3} />
      ))}
    </>
  );
}
