"use client";
import React, { type ReactNode } from "react";

import { Timeline as RootTimeline, type TimelineProps as RootTimelineProps } from "@mantine/core";
import clsx from "clsx";

import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";

export interface TimelineWrapperProps
  extends Omit<RootTimelineProps, "children" | "classNames" | keyof ComponentProps>,
    ComponentProps {
  readonly children?: ReactNode[];
}

const TimelineWrapper = ({ children, className, style, ...props }: TimelineWrapperProps) => (
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
          itemBullet: "timeline__item__bullet",
        }}
      >
        {children}
      </RootTimeline>
    </div>
  </div>
);

export interface TimelineProps<M = unknown> extends Omit<TimelineWrapperProps, "children"> {
  readonly children?: ReactNode[] | ((item: M) => ReactNode);
  readonly data?: M[];
}

export const Timeline = <M,>({ children, data, ...props }: TimelineProps<M>) => {
  if (typeof children === "function") {
    return (
      <TimelineWrapper {...props}>
        {(data ?? []).map((datum, i) => {
          const c = children(datum);
          if (c === null || c === undefined || c === false) {
            return (
              <RootTimeline.Item
                key={i}
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
                {c}
              </RootTimeline.Item>
            );
          }
          return null;
        })}
      </TimelineWrapper>
    );
  }
  return (
    <TimelineWrapper {...props}>
      {(children ?? [])
        .filter(c => c !== null && c !== undefined && c !== false)
        .map((child, i) => (
          <RootTimeline.Item
            key={i}
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
          </RootTimeline.Item>
        ))}
    </TimelineWrapper>
  );
};

export default Timeline;
