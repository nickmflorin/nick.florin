import dynamic from "next/dynamic";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { type TimelineProps } from "./generic";

const Timeline = dynamic(() => import("./generic/Timeline"), {
  loading: () => <Loading loading={true} />,
});
export interface DetailsTimelineProps extends ComponentProps, TimelineProps {}

export const DetailsTimeline = (props: DetailsTimelineProps) => (
  <Timeline {...props} className={clsx("details-timeline", props.className)} />
);

export default DetailsTimeline;
