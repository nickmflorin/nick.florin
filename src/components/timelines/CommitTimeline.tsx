import dynamic from "next/dynamic";

import clsx from "clsx";

import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";

import { Loading } from "../views/Loading";

const Timeline = dynamic(() => import("./Timeline"), { loading: () => <Loading loading={true} /> });
const TimelineItem = dynamic(() => import("./TimelineItem"));

export interface CommitTimelineProps extends ComponentProps {
  readonly children: JSX.Element[];
}

export const CommitTimeline = ({ children, ...props }: CommitTimelineProps) => (
  <div {...props} className={clsx("commit-timeline", props.className)}>
    <div className="commit-timeline__inner">
      <Timeline>
        {children.map((child, index) => (
          <TimelineItem
            key={index}
            bullet={
              <Icon
                name="code-commit"
                dimension="width"
                size="14px"
                iconStyle="solid"
                fit="square"
                family="classic"
              />
            }
          >
            {child}
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  </div>
);

export default CommitTimeline;
