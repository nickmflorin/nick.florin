import { DateTime } from "luxon";

import { DateTimeDisplay, type DateTimeDisplayProps } from "./DateTimeDisplay";
import { Text, type TextProps } from "./Text";

export interface DateTimeDisplayTextProps
  extends Omit<TextProps, "children">,
    DateTimeDisplayProps {}

export const DateTimeDisplayText = ({
  date,
  prefix,
  fontSize = "sm",
  format = DateTime.DATETIME_MED,
  ...props
}: DateTimeDisplayTextProps): JSX.Element => (
  <Text {...props} fontSize={fontSize}>
    <DateTimeDisplay date={date} prefix={prefix} format={format} />
  </Text>
);
