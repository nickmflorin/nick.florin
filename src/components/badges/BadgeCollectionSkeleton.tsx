import { Skeleton } from '~/components/loading/Skeleton';
import { classNames, type ComponentProps } from '~/components/types';

/**
 * The rendered height of a badge at the collection's default size, `sm`: the 18px line height of
 * the badge's text plus the 2px of vertical padding above and below it, as defined by
 * `$badge-sizes` in `src/styles/globals/components/badges.scss`.
 */
const BadgeSkeletonHeight = 22;

/**
 * The widths the badge placeholders cycle through, so that a wrapped row of them breaks at
 * irregular points the way a row of differently sized labels does, rather than tiling evenly.
 */
const BadgeSkeletonWidths = [96, 64, 120, 80, 56, 104];

export interface BadgeCollectionSkeletonProps extends ComponentProps {
  readonly numBadges?: number;
}

export const BadgeCollectionSkeleton = ({
  numBadges = 6,
  ...props
}: BadgeCollectionSkeletonProps) => (
  <div {...props} className={classNames('badge-collection', props.className)}>
    <div className='badge-collection__badges'>
      {Array.from({ length: numBadges }).map((_, i) => (
        <Skeleton
          height={BadgeSkeletonHeight}
          key={i}
          width={BadgeSkeletonWidths[i % BadgeSkeletonWidths.length]}
        />
      ))}
    </div>
  </div>
);
