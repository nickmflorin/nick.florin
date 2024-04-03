import dynamic from "next/dynamic";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { type TimelineProps } from "./generic";

const Timeline = dynamic(() => import("./generic/Timeline"), {
  loading: () => <Loading isLoading={true} />,
});
export interface CommitTimelineProps extends ComponentProps, TimelineProps {}

export const CommitTimeline = (props: CommitTimelineProps) => (
  <Timeline {...props} className={clsx("commit-timeline", props.className)} />
);

export default CommitTimeline;
