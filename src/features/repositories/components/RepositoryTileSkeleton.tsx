import { Skeleton } from "~/components/loading/Skeleton";
import { type ComponentProps } from "~/components/types";
import { ResumeSimpleTileSkeleton } from "~/features/resume/components/tiles/ResumeSimpleTileSkeleton";

export interface RepositoryTileSkeletonProps extends ComponentProps {
  readonly includeDescription?: boolean;
}

export const RepositoryTileSkeleton = (props: RepositoryTileSkeletonProps) => (
  <ResumeSimpleTileSkeleton numDescriptionLines={2} {...props}>
    <Skeleton height={16} width="40%" />
  </ResumeSimpleTileSkeleton>
);
