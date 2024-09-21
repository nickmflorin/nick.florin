import { Skeleton } from "~/components/loading/Skeleton";
import { type ComponentProps } from "~/components/types";
import { ResumeSimpleTileSkeleton } from "~/features/resume/components/tiles/ResumeSimpleTileSkeleton";

export interface ProjectTileSkeletonProps extends ComponentProps {
  readonly includeDescription?: boolean;
}

export const ProjectTileSkeleton = (props: ProjectTileSkeletonProps) => (
  <ResumeSimpleTileSkeleton numDescriptionLines={2} {...props}>
    <Skeleton height={16} width="40%" />
  </ResumeSimpleTileSkeleton>
);
