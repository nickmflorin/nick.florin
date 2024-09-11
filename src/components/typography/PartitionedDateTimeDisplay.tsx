import { DateTime } from "luxon";

import { classNames, type ComponentProps } from "~/components/types";
import { type QuantitativeSize } from "~/components/types/sizes";
import { type TypographyCharacteristics } from "~/components/types/typography";

import { DateTimeDisplay } from "./DateTimeDisplay";
import { Text } from "./Text";

export interface PartitionedDateTimeDisplayProps extends TypographyCharacteristics, ComponentProps {
  readonly date: Date | string;
  readonly gap?: QuantitativeSize<"px">;
  readonly dateFormat?: Intl.DateTimeFormatOptions;
  readonly timeFormat?: Intl.DateTimeFormatOptions;
  readonly dateProps?: TypographyCharacteristics & ComponentProps;
  readonly timeProps?: TypographyCharacteristics & ComponentProps;
}

export const PartitionedDateTimeDisplay = ({
  date,
  gap = "4px",
  dateFormat = DateTime.DATE_MED,
  timeFormat = DateTime.TIME_SIMPLE,
  className,
  style,
  dateProps,
  timeProps,
  ...props
}: PartitionedDateTimeDisplayProps): JSX.Element => (
  <div className={classNames("flex flex-row items-center", className)} style={{ ...style, gap }}>
    <Text
      fontSize="sm"
      fontWeight="medium"
      {...props}
      {...dateProps}
      className={classNames("text-gray-800", dateProps?.className)}
    >
      <DateTimeDisplay date={date} format={dateFormat} />
    </Text>
    <Text
      fontWeight="medium"
      fontSize="sm"
      {...props}
      {...timeProps}
      className={classNames("text-description", timeProps?.className)}
    >
      <DateTimeDisplay date={date} format={timeFormat} />
    </Text>
  </div>
);
