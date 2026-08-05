'use client';
import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { DescriptionSkeleton } from '~/components/typography/DescriptionSkeleton';

import { ResumeModelHeaderScaffold } from './ResumeModelHeaderScaffold';
import { ResumeModelTile } from './ResumeModelTile';

export interface ResumeModelCondensedTileSkeletonProps extends ComponentProps {
  readonly areTagsVisible?: boolean;
  readonly numDescriptionLines?: number;
}

export const ResumeModelCondensedTileSkeleton = ({
  areTagsVisible = true,
  numDescriptionLines = 2,
  ...props
}: ResumeModelCondensedTileSkeletonProps) => (
  <ResumeModelTile {...props}>
    <ResumeModelHeaderScaffold
      areTagsVisible={areTagsVisible}
      image={({ size }) => <Skeleton height={size} width={size} />}
      size='small'
      subTitle={<Skeleton className='w-[30%]' height={14} />}
      tags={ps => <Skeleton {...ps} className={classNames('w-[40%]', ps.className)} height={12} />}
      title={<Skeleton className='w-[55%]' height={18} />}
      titleSectionGap={8}
    >
      <DescriptionSkeleton numLines={numDescriptionLines} />
    </ResumeModelHeaderScaffold>
  </ResumeModelTile>
);
