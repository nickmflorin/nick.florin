"use client";
import {
  TimelineItem as RootTimelineItem,
  type TimelineItemProps as RootTimelineItemProps,
} from "@mantine/core";

import { Icon } from "~/components/icons/Icon";

export interface TimelineItemProsps extends RootTimelineItemProps {}

export const TimelineItem = (props: TimelineItemProsps) => (
  <RootTimelineItem
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
    {...props}
  />
);

export default TimelineItem;
