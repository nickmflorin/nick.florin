import { type TimelineProps } from '~/components/timelines/generic';
import { Timeline } from '~/components/timelines/generic/Timeline';
import { classNames, type ComponentProps } from '~/components/types';

export interface DetailsTimelineProps extends ComponentProps, TimelineProps {}

export const DetailsTimeline = (props: DetailsTimelineProps) => (
  <Timeline {...props} className={classNames('details-timeline', props.className)} />
);
