import { DateTime } from "luxon";

import { Text, type TextProps } from "./Text";
import { TimeDisplay, type TimeDisplayProps } from "./TimeDisplay";

export interface TimeDisplayTextProps extends Omit<TextProps, "children">, TimeDisplayProps {}

export const TimeDisplayText = ({
  date,
  prefix,
  size = "sm",
  format = DateTime.DATETIME_MED,
  ...props
}: TimeDisplayTextProps): JSX.Element => (
  <Text {...props} size={size}>
    <TimeDisplay date={date} prefix={prefix} format={format} />
  </Text>
);
