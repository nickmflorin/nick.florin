import { RepositoryTileSkeleton } from "~/features/repositories/components/RepositoryTileSkeleton";

const Loading = () => (
  <div className="flex flex-col gap-[8px]">
    {Array.from({ length: 7 }).map((_, i) => (
      <RepositoryTileSkeleton key={i} />
    ))}
  </div>
);

export default Loading;
