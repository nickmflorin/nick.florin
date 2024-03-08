import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { type TimelineProps, Timeline } from "./generic";

export interface CommitTimelineProps extends ComponentProps, TimelineProps {}

export const CommitTimeline = (props: CommitTimelineProps) => (
  <Timeline {...props} className={clsx("commit-timeline", props.className)} />
);

export default CommitTimeline;
