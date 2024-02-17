"use client";
import {
  TimelineItem as RootTimelineItem,
  type TimelineItemProps as RootTimelineItemProps,
} from "@mantine/core";

export interface TimelineItemProsps extends RootTimelineItemProps {}

export const TimelineItem = (props: TimelineItemProsps) => <RootTimelineItem {...props} />;

export default TimelineItem;
