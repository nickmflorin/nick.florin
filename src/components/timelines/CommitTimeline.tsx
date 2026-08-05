import { classNames, type ComponentProps } from '~/components/types';

import { type TimelineProps } from './generic';
import { Timeline } from './generic/Timeline';

export interface CommitTimelineProps extends ComponentProps, TimelineProps {}

export const CommitTimeline = (props: CommitTimelineProps) => (
  <Timeline {...props} className={classNames('commit-timeline', props.className)} />
);
