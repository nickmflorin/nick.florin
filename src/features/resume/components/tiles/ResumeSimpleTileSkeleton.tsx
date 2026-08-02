import { type ReactNode } from 'react';

import { Skeleton } from '~/components/loading/Skeleton';
import { type ComponentProps } from '~/components/types';
import { DescriptionSkeleton } from '~/components/typography/DescriptionSkeleton';

import { ResumeSimpleTileScaffold } from './ResumeSimpleTileScaffold';

export interface ResumeSimpleTileSkeletonProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly isDescriptionVisible?: boolean;
  readonly numDescriptionLines?: number;
}

export const ResumeSimpleTileSkeleton = ({
  children,
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
    icon={<Skeleton height={22} width={22} />}
  >
    {children}
  </ResumeSimpleTileScaffold>
);
