import { type JSX } from 'react';

import { TimelineItem } from '@mantine/core';

import { TimelineIcon } from '~/components/icons/TimelineIcon';
import { CommitTimeline } from '~/components/timelines/CommitTimeline';
import { type ComponentProps } from '~/components/types';

import { ResumeModelPageTileSkeleton } from './tiles/ResumeModelPageTileSkeleton';

export interface ResumeTimelineSkeletonProps extends ComponentProps {
  readonly numCourseworkLines?: number;
  readonly numDescriptionLines?: number;
  readonly numDetails?: number;
  readonly numItems?: number;
  readonly numSkills?: number;
}

/**
 * The streaming fallback for the experience and education timelines, rendered through the same
 * {@link CommitTimeline} the timelines themselves use so that the commit line, its bullets and the
 * offset each tile is pulled up by are already in place before the models arrive.
 */
export const ResumeTimelineSkeleton = ({
  numCourseworkLines,
  numDescriptionLines,
  numDetails,
  numItems = 4,
  numSkills,
  ...props
}: ResumeTimelineSkeletonProps): JSX.Element => (
  <CommitTimeline {...props}>
    {Array.from({ length: numItems }).map((_, i) => (
      <TimelineItem bullet={<TimelineIcon />} key={i}>
        <ResumeModelPageTileSkeleton
          numCourseworkLines={numCourseworkLines}
          numDescriptionLines={numDescriptionLines}
          numDetails={numDetails}
          numSkills={numSkills}
        />
      </TimelineItem>
    ))}
  </CommitTimeline>
);
