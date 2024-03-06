"use client";
import { type ReactNode } from "react";

import { Timeline as RootTimeline, type TimelineProps as RootTimelineProps } from "@mantine/core";
import clsx from "clsx";

import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";

import { TimelineItem } from "./TimelineItem";

export interface TimelineProps
  extends Omit<RootTimelineProps, "children" | "classNames" | keyof ComponentProps>,
    ComponentProps {
  readonly children?: ReactNode[];
  readonly items?: ReactNode[];
}

export const Timeline = ({ children, items, className, style, ...props }: TimelineProps) => (
  <div style={style} className={clsx("timeline", className)}>
    <div className="timeline__inner">
      <RootTimeline
        bulletSize={24}
        lineWidth={2}
        {...props}
        classNames={{
          item: "timeline__item",
          itemBody: "timeline__item__body",
          itemContent: "timeline__item__body__content",
        }}
      >
        {(children ?? items ?? []).map((child, index) =>
          child ? (
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
          ) : null,
        )}
      </RootTimeline>
    </div>
  </div>
);

export default Timeline;
