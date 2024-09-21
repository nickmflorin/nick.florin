import { ProjectTileSkeleton } from "~/features/projects/components/ProjectTileSkeleton";

export default function Loading() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProjectTileSkeleton key={i} />
      ))}
    </>
  );
}
