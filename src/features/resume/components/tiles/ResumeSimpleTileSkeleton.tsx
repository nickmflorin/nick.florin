import type { ReactNode } from "react";

import { Skeleton } from "~/components/loading/Skeleton";
import { type ComponentProps } from "~/components/types";
import { DescriptionSkeleton } from "~/components/typography/DescriptionSkeleton";

import { ResumeSimpleTileScaffold } from "./ResumeSimpleTileScaffold";

export interface ResumeSimpleTileSkeletonProps extends ComponentProps {
  readonly numDescriptionLines?: number;
  readonly children?: ReactNode;
  readonly includeDescription?: boolean;
}

export const ResumeSimpleTileSkeleton = ({
  numDescriptionLines = 2,
  includeDescription = true,
  children,
  ...props
}: ResumeSimpleTileSkeletonProps) => (
  <ResumeSimpleTileScaffold
    {...props}
    descriptionGap={8}
    icon={<Skeleton width={22} height={22} />}
    description={includeDescription ? <DescriptionSkeleton numLines={numDescriptionLines} /> : null}
  >
    {children}
  </ResumeSimpleTileScaffold>
);
