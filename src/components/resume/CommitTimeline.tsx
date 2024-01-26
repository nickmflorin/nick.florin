"use client";
import { Timeline } from "@mantine/core";
import clsx from "clsx";

import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";

export interface CommitTimelineProps extends ComponentProps {
  readonly children: JSX.Element[];
}

export const CommitTimeline = ({ children, ...props }: CommitTimelineProps) => (
  <div {...props} className={clsx("commit-timeline", props.className)}>
    <div className="commit-timeline__inner">
      <Timeline
        active={1}
        bulletSize={24}
        lineWidth={2}
        classNames={{
          item: "commit-timeline__item",
          itemBody: "commit-timeline__item__body",
          itemContent: "commit-timeline__item__body__content",
        }}
      >
        {children.map((child, index) => (
          <Timeline.Item
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
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  </div>
);
