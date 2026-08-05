import { type ReactNode } from 'react';

import { Skeleton } from '~/components/loading/Skeleton';
import { type ComponentProps } from '~/components/types';
import { DescriptionSkeleton } from '~/components/typography/DescriptionSkeleton';

import { ResumeSimpleTileScaffold } from './ResumeSimpleTileScaffold';

export interface ResumeSimpleTileSkeletonProps extends ComponentProps {
  readonly children?: ReactNode;
  /**
   * The rendered size of the icon placeholder, matching the `iconSize` the corresponding real
   * tile renders with so that the skeleton and the tile occupy the same space.
   *
   * @default 22
   */
  readonly iconSize?: number;
  readonly isDescriptionVisible?: boolean;
  readonly numDescriptionLines?: number;
}

export const ResumeSimpleTileSkeleton = ({
  children,
  iconSize = 22,
  isDescriptionVisible = true,
  numDescriptionLines = 2,
  ...props
}: ResumeSimpleTileSkeletonProps) => (
  <ResumeSimpleTileScaffold
    {...props}
    description={
      isDescriptionVisible ? <DescriptionSkeleton numLines={numDescriptionLines} /> : null
    }
    descriptionGap={8}
    icon={<Skeleton height={iconSize} width={iconSize} />}
  >
    {children}
  </ResumeSimpleTileScaffold>
);
