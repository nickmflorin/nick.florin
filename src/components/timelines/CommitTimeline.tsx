import dynamic from "next/dynamic";

import clsx from "clsx";

import { Loading } from "~/components/feedback/Loading";
import { type ComponentProps } from "~/components/types";

import { type TimelineProps } from "./generic";

const Timeline = dynamic(() => import("./generic/Timeline"), {
  loading: () => <Loading isLoading={true} />,
});
export interface CommitTimelineProps extends ComponentProps, TimelineProps {}

export const CommitTimeline = (props: CommitTimelineProps) => (
  <Timeline {...props} className={clsx("commit-timeline", props.className)} />
);

export default CommitTimeline;
