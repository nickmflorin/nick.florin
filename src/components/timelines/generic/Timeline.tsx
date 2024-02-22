"use client";
import { type ReactNode } from "react";

import { Timeline as RootTimeline } from "@mantine/core";

export interface CommitTimelineProps {
  readonly children: ReactNode;
}

export const Timeline = ({ children }: CommitTimelineProps) => (
  <RootTimeline
    bulletSize={24}
    lineWidth={2}
    classNames={{
      item: "commit-timeline__item",
      itemBody: "commit-timeline__item__body",
      itemContent: "commit-timeline__item__body__content",
    }}
  >
    {children}
  </RootTimeline>
);

export default Timeline;
