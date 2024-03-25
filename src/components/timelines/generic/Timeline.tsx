"use client";
import React from "react";

import { Timeline as RootTimeline } from "@mantine/core";
import clsx from "clsx";

import { type TimelineProps } from "./types";

export const Timeline = ({ children, style, className, ...props }: TimelineProps) => (
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

export default Timeline;
