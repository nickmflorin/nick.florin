import { BadgeCollectionSkeleton } from '~/components/badges/BadgeCollectionSkeleton';
import { Skeleton, SkeletonLineOffset } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';
import { DescriptionSkeleton } from '~/components/typography/DescriptionSkeleton';

export interface DetailsSkeletonProps extends ComponentProps {
  readonly numDetails?: number;
  readonly numSkillsPerDetail?: number;
}

export const DetailsSkeleton = ({
  numDetails = 3,
  numSkillsPerDetail = 5,
  ...props
}: DetailsSkeletonProps) => (
  <div
    {...props}
    className={classNames('flex flex-col gap-[10px] max-md:gap-[8px]', props.className)}
  >
    {Array.from({ length: numDetails }).map((_, i) => (
      <div className='flex flex-col gap-[10px] max-md:gap-[8px]' key={i}>
        <div className='flex flex-col gap-[4px]'>
          <Skeleton className={classNames('w-[45%]', SkeletonLineOffset)} height={14} />
          <DescriptionSkeleton numLines={2} />
        </div>
        <BadgeCollectionSkeleton className='sm:max-w-[800px]' numBadges={numSkillsPerDetail} />
      </div>
    ))}
  </div>
);
