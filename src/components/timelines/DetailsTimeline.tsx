import clsx from "clsx";

import { type TimelineProps, Timeline } from "./generic";

export interface DetailsTimelineProps extends TimelineProps {}

export const DetailsTimeline = (props: DetailsTimelineProps) => (
  <Timeline {...props} className={clsx("details-timeline", props.className)} />
);

export default DetailsTimeline;
