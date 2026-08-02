import dynamic from 'next/dynamic';

import { Loading } from '~/components/loading/Loading';
import { type TimelineProps } from '~/components/timelines/generic';
import { classNames, type ComponentProps } from '~/components/types';

const Timeline = dynamic(
  () => import('~/components/timelines/generic/Timeline').then(mod => mod.Timeline),
  {
    loading: () => <Loading isLoading />,
  },
);
export interface DetailsTimelineProps extends ComponentProps, TimelineProps {}

export const DetailsTimeline = (props: DetailsTimelineProps) => (
  <Timeline {...props} className={classNames('details-timeline', props.className)} />
);
