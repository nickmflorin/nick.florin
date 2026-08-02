import dynamic from 'next/dynamic';

import { Loading } from '~/components/loading/Loading';
import { classNames, type ComponentProps } from '~/components/types';

import { type TimelineProps } from './generic';

const Timeline = dynamic(() => import('./generic/Timeline').then(mod => mod.Timeline), {
  loading: () => <Loading isLoading />,
});
export interface CommitTimelineProps extends ComponentProps, TimelineProps {}

export const CommitTimeline = (props: CommitTimelineProps) => (
  <Timeline {...props} className={classNames('commit-timeline', props.className)} />
);
