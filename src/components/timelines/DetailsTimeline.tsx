import dynamic from "next/dynamic";

import clsx from "clsx";

import { Loading } from "~/components/feedback/Loading";
import { type ComponentProps } from "~/components/types";

import { type TimelineProps } from "./generic";

const Timeline = dynamic(() => import("./generic/Timeline"), {
  loading: () => <Loading isLoading={true} />,
});
export interface DetailsTimelineProps extends ComponentProps, TimelineProps {}

export const DetailsTimeline = (props: DetailsTimelineProps) => (
  <Timeline {...props} className={clsx("details-timeline", props.className)} />
);

export default DetailsTimeline;
