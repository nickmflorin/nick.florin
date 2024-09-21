"use client";
import { Skeleton } from "~/components/loading/Skeleton";
import { type ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { DescriptionSkeleton } from "~/components/typography/DescriptionSkeleton";

import { ResumeModelHeaderScaffold } from "./ResumeModelHeaderScaffold";
import { ResumeModelTile } from "./ResumeModelTile";

export interface ResumeModelCondensedTileSkeletonProps extends ComponentProps {
  readonly showTags?: boolean;
  readonly numDescriptionLines?: number;
}

export const ResumeModelCondensedTileSkeleton = ({
  showTags = true,
  numDescriptionLines = 2,
  ...props
}: ResumeModelCondensedTileSkeletonProps) => (
  <ResumeModelTile {...props}>
    <ResumeModelHeaderScaffold
      size="small"
      showTags={showTags}
      titleSectionGap={8}
      tags={ps => <Skeleton {...ps} height={12} className={classNames("w-[40%]", ps.className)} />}
      title={<Skeleton height={18} className="w-[30%]" />}
      subTitle={<Skeleton height={14} className="w-[40%]" />}
      image={({ size }) => <Skeleton width={size} height={size} />}
    >
      <DescriptionSkeleton numLines={numDescriptionLines} />
    </ResumeModelHeaderScaffold>
  </ResumeModelTile>
);
