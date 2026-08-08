'use client';
import { BadgeCollectionSkeleton } from '~/components/badges/BadgeCollectionSkeleton';
import { Skeleton, SkeletonLineOffset } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { DescriptionSkeleton } from '~/components/typography/DescriptionSkeleton';

import { DetailsSkeleton } from './DetailsSkeleton';
import { ResumeModelHeaderScaffold } from './ResumeModelHeaderScaffold';
import { ResumeModelTile } from './ResumeModelTile';

export interface ResumeModelPageTileSkeletonProps extends ComponentProps {
  /**
   * The number of description lines the coursework section stands in for, or `0` when the tile
   * stands in for a model that renders no coursework at all.
   *
   * @default 0
   */
  readonly numCourseworkLines?: number;
  readonly numDescriptionLines?: number;
  readonly numDetails?: number;
  readonly numSkills?: number;
}

export const ResumeModelPageTileSkeleton = ({
  numCourseworkLines = 0,
  numDescriptionLines = 2,
  numDetails = 3,
  numSkills = 8,
  ...props
}: ResumeModelPageTileSkeletonProps) => (
  <ResumeModelTile
    {...props}
    className={classNames('gap-[10px] max-md:gap-[8px]', props.className)}
  >
    <ResumeModelHeaderScaffold
      image={({ size }) => <Skeleton height={size} width={size} />}
      size='large'
      subTitle={<Skeleton className={classNames('w-[30%]', SkeletonLineOffset)} height={14} />}
      tags={ps => <Skeleton {...ps} className={classNames('w-[35%]', ps.className)} height={16} />}
      title={<Skeleton className={classNames('w-[55%]', SkeletonLineOffset)} height={18} />}
    >
      <div className='flex flex-col gap-[10px] max-md:gap-[8px]'>
        <div className='flex flex-col gap-[10px] max-w-[700px]'>
          {numDescriptionLines > 0 ? <DescriptionSkeleton numLines={numDescriptionLines} /> : null}
          <DetailsSkeleton numDetails={numDetails} />
        </div>
        {numCourseworkLines > 0 ? (
          <div className='flex flex-col gap-[6px]'>
            <Skeleton className={SkeletonLineOffset} height={14} width={90} />
            <DescriptionSkeleton className='max-w-[800px]' numLines={numCourseworkLines} />
          </div>
        ) : null}
        <div className='flex flex-col gap-[10px]'>
          <Skeleton className={SkeletonLineOffset} height={14} width={80} />
          <BadgeCollectionSkeleton className='max-w-[800px]' numBadges={numSkills} />
        </div>
      </div>
    </ResumeModelHeaderScaffold>
  </ResumeModelTile>
);
