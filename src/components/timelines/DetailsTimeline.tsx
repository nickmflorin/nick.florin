import dynamic from "next/dynamic";
import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { type TimelineProps } from "./generic";

const Timeline = dynamic(() => import("./generic/Timeline"), {
  loading: () => <Loading loading={true} />,
});

export interface DetailsTimelineProps extends ComponentProps, Omit<TimelineProps, "children"> {
  readonly children?: ReactNode[];
}

export const DetailsTimeline = (props: DetailsTimelineProps) => (
  <Timeline {...props} className={clsx("details-timeline", props.className)} />
);

export default DetailsTimeline;
